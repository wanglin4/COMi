import { create } from "zustand";
import { deriveBlsFromSignature, getAddressFromScalar, encryptData, decryptData } from "@/lib/crypto";

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface WalletState {
  ethAddress: string | null;
  blsAddress: string | null;
  isAuthority: boolean;
  isConnecting: boolean;
  error: string | null;
  
  connect: () => Promise<void>;
  silentReconnect: () => Promise<void>;
  disconnect: () => void;
}

async function waitForEthereum(timeoutMs = 3000): Promise<any> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (window.ethereum) return window.ethereum;
    await new Promise((r) => setTimeout(r, 100));
  }
  return window.ethereum ?? null;
}

const AUTHORITY_ADDRESS = process.env.NEXT_PUBLIC_AUTHORITY_ADDRESS?.toLowerCase() || "";

export const useWalletStore = create<WalletState>((set, get) => ({
  ethAddress: null,
  blsAddress: null,
  isAuthority: false,
  isConnecting: false,
  error: null,

  connect: async () => {
    set({ isConnecting: true, error: null });
    try {
      const provider = await waitForEthereum(3000);
      if (!provider) throw new Error("Wallet extension not found");
      const accounts = await provider.request({ method: "eth_requestAccounts" });
      const ethAddress = accounts[0].toLowerCase();
      
      const msg = "Sign this message to derive your COMi prediction market key.";
      const signature = await provider.request({
        method: "personal_sign",
        params: [msg, ethAddress],
      });
      
      const scalar = await deriveBlsFromSignature(signature);
      const blsAddress = getAddressFromScalar(scalar);
      
      const encrypted = await encryptData(scalar, ethAddress);
      localStorage.setItem("comi_cache", JSON.stringify({ ethAddress, encrypted }));
      
      set({
        ethAddress,
        blsAddress,
        isAuthority: ethAddress === AUTHORITY_ADDRESS,
        isConnecting: false,
      });
    } catch (e: any) {
      set({ error: e.message || "Connection failed", isConnecting: false });
    }
  },

  silentReconnect: async () => {
    const cache = localStorage.getItem("comi_cache");
    if (!cache) return;
    
    try {
      const { ethAddress, encrypted } = JSON.parse(cache);
      const scalar = await decryptData(encrypted, ethAddress);
      const blsAddress = getAddressFromScalar(scalar);
      
      set({
        ethAddress,
        blsAddress,
        isAuthority: ethAddress.toLowerCase() === AUTHORITY_ADDRESS,
      });
    } catch (e) {
      console.warn("Silent reconnect failed", e);
      localStorage.removeItem("comi_cache");
    }
  },

  disconnect: () => {
    localStorage.removeItem("comi_cache");
    set({ ethAddress: null, blsAddress: null, isAuthority: false });
  }
}));
