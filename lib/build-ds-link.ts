import { Blockchain } from "@/types/enum";

export const buildDexScreenerLink = (blockchain: Blockchain, address: string) => {
  return `https://dexscreener.com/${blockchain.toLowerCase()}/${address}`;
};
