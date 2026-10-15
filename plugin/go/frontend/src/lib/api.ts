export const NODE_RPC = process.env.NEXT_PUBLIC_NODE_RPC_URL || "http://localhost:8545";

export async function rpcPost<T = any>(path: string, body: any): Promise<T> {
  const res = await fetch(`${NODE_RPC}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${path} -> ${res.status} ${res.statusText}`);
  return (await res.json()) as T;
}
