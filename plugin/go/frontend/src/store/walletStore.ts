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
  drifted: boolean;
  error: string | null;

  connect: () => Promise<void>;
  silentReconnect: () => Promise<void>;
  reconnect: () => Promise<void>;
  disconnect: () => void;
  startSync: () => void;
  stopSync: () => void;
}

const AUTHORITY_ADDRESS = process.env.NEXT_PUBLIC_AUTHORITY_ADDRESS?.toLowerCase() || "";
const DERIVE_MSG = "Sign this message to derive your COMi prediction market key.";

let syncTimer: ReturnType<typeof setInterval> | null = null;
let syncBound = false;

async function waitForEthereum(timeoutMs = 3000): Promise<any> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (window.ethereum) return window.ethereum;
    await new Promise((r) => setTimeout(r, 100));
  }
  return window.ethereum ?? null;
}

async function performConnect(): Promise<{ ethAddress: string; blsAddress: string }> {
  const provider = await waitForEthereum(3000);
  if (!provider) throw new Error("Wallet extension not found");
  const accounts: string[] = await provider.request({ method: "eth_requestAccounts" });
  if (!accounts || accounts.length === 0) throw new Error("No accounts returned");
  const ethAddress = accounts[0].toLowerCase();
  const signature: string = await provider.request({
    method: "personal_sign",
    params: [DERIVE_MSG, ethAddress],
  });
  const scalar = await deriveBlsFromSignature(signature);
  const blsAddress = getAddressFromScalar(scalar);
  const encrypted = await encryptData(scalar, ethAddress);
  localStorage.setItem("comi_cache", JSON.stringify({ ethAddress, encrypted }));
  return { ethAddress, blsAddress };
}

export const useWalletStore = create<WalletState>((set, get) => ({
  ethAddress: null,
  blsAddress: null,
  isAuthority: false,
  isConnecting: false,
  drifted: false,
  error: null,

  connect: async () => {
    set({ isConnecting: true, error: null });
    try {
      const { ethAddress, blsAddress } = await performConnect();
      set({
        ethAddress,
        blsAddress,
        isAuthority: ethAddress === AUTHORITY_ADDRESS,
        isConnecting: false,
        drifted: false,
      });
      get().startSync();
    } catch (e: any) {
      set({ error: e?.message || "Connection failed", isConnecting: false });
    }
  },

  reconnect: async () => {
    await get().connect();
  },

  silentReconnect: async () => {
    const cache = localStorage.getItem("comi_cache");
    if (!cache) return;
    try {
      const { ethAddress, encrypted } = JSON.parse(cache);
      const scalar = await decryptData(encrypted, ethAddress);
      const blsAddress = getAddressFromScalar(scalar);
      set({ ethAddress, blsAddress, isAuthority: ethAddress.toLowerCase() === AUTHORITY_ADDRESS });
      get().startSync();
    } catch (e) {
      console.warn("Silent reconnect failed", e);
      localStorage.removeItem("comi_cache");
    }
  },

  disconnect: () => {
    get().stopSync();
    localStorage.removeItem("comi_cache");
    set({ ethAddress: null, blsAddress: null, isAuthority: false, drifted: false });
  },

  startSync: () => {
    if (typeof window === "undefined") return;
    if (syncTimer) return;
    const check = async () => {
      const { ethAddress } = get();
      if (!ethAddress) return;
      const provider = window.ethereum;
      if (!provider) return;
      try {
        const accounts: string[] = await provider.request({ method: "eth_accounts" });
        // Mobile bridges may return [] for authorized origins: treat as unknown, not drift
        if (!accounts || accounts.length === 0) return;
        const current = accounts[0].toLowerCase();
        set({ drifted: current !== ethAddress });
      } catch (e) {
        console.warn("Drift probe failed", e);
      }
    };
    syncTimer = setInterval(check, 15000);
    if (!syncBound) {
      window.addEventListener("focus", check);
      document.addEventListener("visibilitychange", check);
      syncBound = true;
    }
    check();
  },

  stopSync: () => {
    if (syncTimer) {
      clearInterval(syncTimer);
      syncTimer = null;
    }
  },
}));
