package contract

import (
	"bytes"
	"encoding/hex"
	"os"
	"path/filepath"
	"testing"
)

func TestBeginBlockInitsAdmin(t *testing.T) {
	dir := t.TempDir()
	st := newMem()
	c := &Contract{Config: Config{DataDirPath: dir}, st: st}
	if r := c.BeginBlock(&PluginBeginRequest{Height: 1}); r.Error == nil {
		t.Fatal("height 1 without a genesis file must fail")
	}
	if r := c.BeginBlock(&PluginBeginRequest{Height: 5}); r.Error != nil {
		t.Fatal(r.Error)
	}
	if st.writes != 0 {
		t.Fatal("must not write before height 1 succeeds or after height 1")
	}
	file := filepath.Join(dir, GenesisFileName)
	_ = os.WriteFile(file, []byte(`{"admin":"0x`+hex.EncodeToString(addr(3))+`"}`), 0o600)
	if c.BeginBlock(&PluginBeginRequest{Height: 5}); st.writes != 0 {
		t.Fatal("heights above 1 must never initialise the admin")
	}
	if r := c.BeginBlock(&PluginBeginRequest{Height: 1}); r.Error != nil {
		t.Fatal(r.Error)
	}
	if got, err := readAdmin(st); err != nil || !bytes.Equal(got, addr(3)) {
		t.Fatalf("admin not stored: %x %v", got, err)
	}
	_ = os.WriteFile(file, []byte(`{"admin":"0x`+hex.EncodeToString(addr(4))+`"}`), 0o600)
	c.BeginBlock(&PluginBeginRequest{Height: 1})
	if got, _ := readAdmin(st); !bytes.Equal(got, addr(3)) {
		t.Fatal("existing admin must never be overwritten")
	}
}
