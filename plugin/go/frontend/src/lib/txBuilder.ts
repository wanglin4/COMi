import { sha256 } from "@noble/hashes/sha2.js";
import { hexToBytes, bytesToHex } from "@noble/hashes/utils.js";
// @ts-ignore - generated static protobuf module (browser-safe)
import * as pb from "@/proto/comi_pb";

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

const TYPE_NAMES: Record<string, string> = {
  send: "MessageSend",
  register_asset: "MessageRegisterAsset",
  set_gate: "MessageSetGate",
  set_cusd_params: "MessageSetCUSDParams",
  post_price: "MessagePostPrice",
  vault_deposit: "MessageVaultDeposit",
  vault_withdraw: "MessageVaultWithdraw",
  cusd_mint: "MessageCUSDMint",
  cusd_burn: "MessageCUSDBurn",
  cusd_transfer: "MessageCUSDTransfer",
  liquidate: "MessageLiquidate",
  issue_units: "MessageIssueUnits",
  transfer_units: "MessageTransferUnits",
  place_order: "MessagePlaceOrder",
  cancel_order: "MessageCancelOrder",
  set_oracle: "MessageSetOracle",
  report_price: "MessageReportPrice",
};

// protobufjs bytes fields accept Uint8Array/base64, not 0x-hex: convert 20-byte hex addresses
function normalizeBytes(obj: any): any {
  if (Array.isArray(obj)) return obj.map(normalizeBytes);
  if (obj && typeof obj === "object") {
    const out: any = {};
    for (const [k, v] of Object.entries(obj)) out[k] = normalizeBytes(v);
    return out;
  }
  if (typeof obj === "string" && /^0x[0-9a-fA-F]{40}$/.test(obj)) return hexToBytes(obj.slice(2));
  return obj;
}

export async function buildAndSignTransaction(
  params: TxParams,
  ethAddress: string,
  provider: any
): Promise<any> {
  const P: any = pb as any;
  const name = TYPE_NAMES[params.messageType];
  if (!name) throw new Error(`Unsupported message type: ${params.messageType}`);
  const MsgCtor = P.types[name];
  if (!MsgCtor) throw new Error(`Proto class missing: types.${name}`);

  const msgObj = MsgCtor.fromObject(normalizeBytes(params.msg));
  const msgBytes = MsgCtor.encode(msgObj).finish();

  const anyObj = P.google.protobuf.Any.create({ type_url: params.typeUrl, value: msgBytes });

  const tx = P.types.Transaction.create({
    message_type: params.messageType,
    msg: anyObj,
    created_height: params.createdHeight,
    time: Math.floor(Date.now() / 1000),
    fee: params.fee,
    memo: params.memo || "",
    network_id: params.networkId,
    chain_id: params.chainId,
    nonce: params.nonce,
  });

  const txBytes = P.types.Transaction.encode(tx).finish();

  // NOTE(signing): Canopy verifies ethCrypto.VerifySignature(pubkey, SHA256(txBytes), sig64).
  // Rabby personal_sign applies EIP-191 prefixing, so this signature will NOT verify until
  // the protocol accepts EIP-191 digests or we switch to node-keystore signing.
  // We sign the raw tx bytes here so the envelope is complete and the decision is isolated.
  const signature: string = await provider.request({
    method: "personal_sign",
    params: ["0x" + bytesToHex(txBytes), ethAddress],
  });

  const sigBytes = hexToBytes(signature.startsWith("0x") ? signature.slice(2) : signature);
  const sig64 = sigBytes.slice(0, 64); // drop recovery byte; Canopy expects r||s

  // TODO(signing-decision): replace placeholder with recovered/encoded pubkey per
  // lib/crypto/eth_secp256k1.go (64-byte uncompressed, no SEC1 prefix) once Option A/B is chosen.
  const pubkeyBytes = new Uint8Array(64);

  tx.signature = P.types.Signature.create({ public_key: pubkeyBytes, signature: sig64 });

  return P.types.Transaction.toObject(tx, { bytes: String, longs: String });
}

export async function getAccountNonce(address: string, rpcUrl: string): Promise<number> {
  const response = await fetch(`${rpcUrl}/v1/account`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address: address.replace(/^0x/, "") }),
  });
  if (!response.ok) throw new Error(`Failed to fetch account: ${response.status} ${response.statusText}`);
  const account = await response.json();
  return Number(account.nonce || 0);
}

export async function submitTransaction(signedTx: any, rpcUrl: string): Promise<string> {
  const response = await fetch(`${rpcUrl}/v1/tx`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(signedTx),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Submission failed: ${response.status} ${text}`);
  }
  return await response.json();
}

export function txDigestHex(signedTx: any): string {
  return "(digest available after re-encode; unused until signing decision)";
}
