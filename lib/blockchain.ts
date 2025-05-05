import { Blockchain } from "@/types/enum";

const networkIdToBlockchain: { [key: number]: Blockchain } = {
  // EVM chains
  1: Blockchain.ETHEREUM,
  10: Blockchain.OPTIMISM,
  56: Blockchain.BSC,
  137: Blockchain.POLYGON,
  146: Blockchain.SONIC,
  8453: Blockchain.BASE,
  42161: Blockchain.ARBITRUM,
  43114: Blockchain.AVALANCHE,
  81457: Blockchain.BLAST,
  2741: Blockchain.ABSTRACT,
  // Other chains
  1399811149: Blockchain.SOLANA,
};

export const getBlockchainFromNetworkId = (networkId: number): Blockchain | undefined => {
  return networkIdToBlockchain[networkId];
};