package contract

import (
	"bytes"
	"encoding/binary"
	"io"
	"net"
	"net/http"
	"sync/atomic"
	"testing"

	"google.golang.org/protobuf/proto"
)

// fakeFSM serves detached queries over the plugin socket framing (4 byte big-endian length + proto) from
// an in-memory state, the way Canopy core answers Plugin.QueryState
type fakeFSM struct {
	st       *memState
	requests atomic.Int32
	badAsk   atomic.Bool // set when a request was not a plain latest-height query
}

func (f *fakeFSM) serve(conn net.Conn) {
	for {
		lenb := make([]byte, 4)
		if _, err := io.ReadFull(conn, lenb); err != nil {
			return
		}
		bz := make([]byte, binary.BigEndian.Uint32(lenb))
		if _, err := io.ReadFull(conn, bz); err != nil {
			return
		}
		req := new(PluginToFSM)
		if err := proto.Unmarshal(bz, req); err != nil || req.GetQuery() == nil {
			f.badAsk.Store(true)
			return
		}
		f.requests.Add(1)
		if req.GetQuery().Height != 0 {
			f.badAsk.Store(true)
		}
		resp := new(PluginStateReadResponse)
		for _, k := range req.GetQuery().GetRead().GetKeys() {
			res := &PluginReadResult{QueryId: k.QueryId}
			// like core, a missing key simply has no entries
			if v, ok := f.st.m[string(k.Key)]; ok {
				res.Entries = []*PluginStateEntry{{Key: k.Key, Value: bytes.Clone(v)}}
			}
			resp.Results = append(resp.Results, res)
		}
		for _, rg := range req.GetQuery().GetRead().GetRanges() {
			ents, _ := f.st.Range(rg.Prefix, rg.Limit)
			resp.Results = append(resp.Results, &PluginReadResult{QueryId: rg.QueryId, Entries: ents})
		}
		out, err := proto.Marshal(&FSMToPlugin{Id: req.Id, Payload: &FSMToPlugin_Query{Query: &PluginQueryResponse{Read: resp}}})
		if err != nil {
			return
		}
		lp := make([]byte, 4)
		binary.BigEndian.PutUint32(lp, uint32(len(out)))
		if _, err := conn.Write(append(lp, out...)); err != nil {
			return
		}
	}
}

// TestChainReaderOverTheWire runs the production state adapter, and the whole HTTP API on top of it,
// through a real Plugin talking to a fake core over a pipe
func TestChainReaderOverTheWire(t *testing.T) {
	q := newQ(t)
	q.issue(10, 5)
	pluginEnd, coreEnd := net.Pipe()
	p := &Plugin{conn: pluginEnd, pending: map[uint64]chan isFSMToPlugin_Payload{}, requestContract: map[uint64]*Contract{}}
	fsm := &fakeFSM{st: q.st}
	go fsm.serve(coreEnd)
	go p.ListenForInbound()
	r := &chainReader{p: p}

	// point reads: present, missing and present again, in order
	vals, err := r.Read(KeyForAsset(1), KeyForAsset(99), KeyForUnitSupply(1))
	if err != nil {
		t.Fatal(err)
	}
	if !bytes.Equal(vals[0], q.st.m[string(KeyForAsset(1))]) || vals[1] != nil || !bytes.Equal(vals[2], q.st.m[string(KeyForUnitSupply(1))]) {
		t.Fatalf("point reads came back wrong: %x", vals)
	}

	// 250 keys are split into 3 requests of at most 100 and come back in order
	fsm.requests.Store(0)
	keys := make([][]byte, 250)
	for i := range keys {
		keys[i] = KeyForAsset(99)
	}
	for _, i := range []int{0, 99, 100, 249} {
		keys[i] = KeyForAsset(1)
	}
	vals, err = r.Read(keys...)
	if err != nil {
		t.Fatal(err)
	}
	for i, v := range vals {
		hit := i == 0 || i == 99 || i == 100 || i == 249
		if hit != (len(v) > 0) {
			t.Fatalf("key %d: present=%v, want %v", i, len(v) > 0, hit)
		}
	}
	if n := fsm.requests.Load(); n != 3 {
		t.Fatalf("250 keys took %d requests, want 3", n)
	}
	if vals, err := r.Read(); err != nil || len(vals) != 0 {
		t.Fatalf("an empty read must be a no-op: %v %v", vals, err)
	}

	// ranges: ascending, bounded by the limit
	ents, err := r.Range(JoinLenPrefix(gatePrefix, formatUint64(1)), 2)
	if err != nil || len(ents) != 2 || !bytes.Equal(tailSegment(ents[0].Key, 20), addr(10)) || !bytes.Equal(tailSegment(ents[1].Key, 20), addr(11)) {
		t.Fatalf("range came back wrong: %v %v", ents, err)
	}

	// the full HTTP API over the same wire
	mux := http.NewServeMux()
	newQueryMux(mux, r, LatestHeight, "wire-test")
	q.mux = mux
	a := q.get("/v1/query/asset?id=1")
	q.want(a, "BOND1", "asset", "symbol")
	q.want(a, "5", "issued")
	q.want(q.get("/v1/query/gate?asset_id=1&address="+hx(10)), true, "allowed")
	q.length(q.get("/v1/query/gates?asset_id=1"), 3, "addresses")
	q.want(q.get("/v1/query/account?address="+hx(10)), "300000000", "cusd")
	if fsm.badAsk.Load() {
		t.Fatal("the plugin sent something other than latest-height queries")
	}
}
