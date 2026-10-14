import { bls12_381 } from "@noble/curves/bls12-381.js";
import { bytesToHex } from "@noble/hashes/utils.js";

// Use a dummy 32-byte scalar
const dummyScalar = new Uint8Array(32).fill(1);
const scalarBigInt = BigInt("0x" + bytesToHex(dummyScalar));

try {
    // Try to derive the public key
    const pubkey = bls12_381.G1.Point.BASE.multiply(scalarBigInt).toRawBytes();
    console.log("✓ Success! Public key length:", pubkey.length);
    console.log("✓ Public key (hex):", bytesToHex(pubkey));
} catch (e) {
    console.error("✗ Error:", e.message);
}
