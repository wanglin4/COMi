package contract

import (
	"log"
	"net/http"
)

/*
This file is the SKELETON for a plugin's own HTTP server, where a builder exposes custom,
chain-specific RPC endpoints.

Canopy core only exposes a single, generic, read-only transport over the unix socket:
`Plugin.QueryState(height, read)`, which returns raw key/value state at a historical height
(0 = latest committed). The plugin process owns its HTTP server entirely, so builders may register
as many routes as they want and decode their own keys/protobufs into whatever response shapes they
like. Canopy never needs to know about chain-specific endpoints.

COMi registers its read-only query routes from query.go (see /v1/query for the list). See TUTORIAL.md ("Custom RPC endpoints") for a full, worked
example you can follow to add your own handlers backed by QueryState.
*/

// StartRPCServer() launches the plugin's own HTTP server. By default it registers NO routes;
// builders add their own with mux.HandleFunc(...), each backed by the detached, read-only
// QueryState() path to fetch state snapshots from Canopy.
func (p *Plugin) StartRPCServer() {
	// resolve the listen address from config
	addr := p.config.RPCAddress
	// if no address is configured, the RPC server is disabled
	if addr == "" {
		log.Println("plugin RPC server disabled (no rpcAddress configured)")
		return
	}
	// build a router; register your custom endpoints here, e.g.:
	//
	//   mux.HandleFunc("/v1/query/myrecords", func(w http.ResponseWriter, r *http.Request) {
	//       resp, err := p.QueryState(0 /* latest */, &PluginStateReadRequest{ ... })
	//       // decode resp into your own protobuf type and write the JSON response
	//   })
	//
	mux := http.NewServeMux()
	// the read-only query API (query.go), backed by QueryState at the latest committed state
	newQueryMux(mux, &chainReader{p: p}, LatestHeight, PluginBuild)
	// log the build marker so the running version is obvious in the log
	log.Printf("plugin RPC server (%s) listening on %s (query routes under /v1/query)", PluginBuild, addr)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Printf("plugin RPC server error: %v", err)
	}
}
