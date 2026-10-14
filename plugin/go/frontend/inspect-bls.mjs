import { bls12_381 } from "@noble/curves/bls12-381.js";

console.log("=== bls12_381 top-level keys ===");
console.log(Object.keys(bls12_381));

if (bls12_381.G1) {
    console.log("\n=== bls12_381.G1 keys ===");
    console.log(Object.keys(bls12_381.G1));
    
    if (bls12_381.G1.ProjectivePoint) {
        console.log("\n=== G1.ProjectivePoint keys ===");
        console.log(Object.keys(bls12_381.G1.ProjectivePoint));
    } else {
        console.log("\nG1 is not a namespace with ProjectivePoint.");
        console.log("G1 type:", typeof bls12_381.G1);
        if (typeof bls12_381.G1 === 'function') {
            console.log("G1 function name:", bls12_381.G1.name);
        }
    }
}

if (bls12_381.G2) {
    console.log("\n=== bls12_381.G2 keys ===");
    console.log(Object.keys(bls12_381.G2));
}
