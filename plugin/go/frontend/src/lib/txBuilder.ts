import protobuf from "protobufjs";
import { sha256 } from "@noble/hashes/sha2.js";
import { hexToBytes, bytesToHex } from "@noble/hashes/utils.js";

export interface TxParams {
  messageType: string;
  msg: any;
  typeUrl: string;
  signer: string;
  nonce: number;
  fee: number;
  networkId: number;
  chainId: number;
  createdHeight: number;
  memo?: string;
}

export interface SignedTransaction {
  message_type: string;
  msg: { type_url: string; value: string };
  signature: {
    public_key: string;
    signature: string;
  };
  created_height: string;
  time: string;
  fee: string;
  memo: string;
  network_id: string;
  chain_id: string;
  nonce: string;
}

export async function buildAndSignTransaction(
  params: TxParams,
  ethAddress: string,
  provider: any
): Promise<SignedTransaction> {
  // Load proto definitions
  const root = await protobuf.load(["src/proto/tx.proto", "src/proto/comi.proto"]);
  const Transaction = root.lookupType("types.Transaction");
  const Signature = root.lookupType("types.Signature");
  const Any = root.lookupType("google.protobuf.Any");

  // Encode the message payload
  const MsgType = root.lookupType(`types.${params.messageType.replace("_", "")}`);
  const msgEncoded = MsgType.encode(params.msg).finish();

  // Build the Any wrapper
  const anyPayload = Any.create({
    type_url: params.typeUrl,
    value: msgEncoded,
  });

  // Build unsigned transaction
  const unsignedTx = Transaction.create({
    message_type: params.messageType,
    msg: anyPayload,
    created_height: params.createdHeight,
    time: Math.floor(Date.now() / 1000),
    fee: params.fee,
    memo: params.memo || "",
    network_id: params.networkId,
    chain_id: params.chainId,
    nonce: params.nonce,
  });

  // Serialize to bytes
  const txBytes = Transaction.encode(unsignedTx).finish();
  
  // Hash the transaction bytes
  const txHash = sha256(txBytes);
  const txHashHex = "0x" + bytesToHex(txHash);

  // Request signature from wallet
  const signature: string = await provider.request({
    method: "eth_sign",
    params: [ethAddress, txHashHex],
  });

  // Get public key (32 bytes compressed secp256k1)
  // Note: eth_sign returns 65-byte signature (r, s, v), we need to extract pubkey
  // For now, use a placeholder - actual implementation needs ecrecover
  const pubkeyBytes = new Uint8Array(33); // Placeholder
  
  // Build signature object
  const sig = Signature.create({
    public_key: pubkeyBytes,
    signature: hexToBytes(signature.startsWith("0x") ? signature.slice(2) : signature),
  });

  // Build signed transaction
  const signedTx = {
    ...Transaction.toObject(unsignedTx),
    signature: Signature.toObject(sig),
  };

  return signedTx as SignedTransaction;
}

export async function getAccountNonce(address: string, rpcUrl: string): Promise<number> {
  const response = await fetch(`${rpcUrl}/v1/account`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch account: ${response.statusText}`);
  }
  
  const account = await response.json();
  return account.nonce || 0;
}

export async function submitTransaction(signedTx: SignedTransaction, rpcUrl: string): Promise<string> {
  const response = await fetch(`${rpcUrl}/v1/tx`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(signedTx),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Transaction submission failed");
  }
  
  const txHash = await response.json();
  return txHash;
}
