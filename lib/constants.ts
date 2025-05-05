export const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3232';
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

export const RPC_URL = (chain: string): string => {
    switch (chain.toUpperCase()) {
        case 'ETHEREUM':
            return process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL || '';
        case 'BASE':
            return process.env.NEXT_PUBLIC_BASE_RPC_URL || '';
        case 'BSC':
            return process.env.NEXT_PUBLIC_BSC_RPC_URL || '';
        case 'ARBITRUM':
            return process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL || '';
        case 'AVALANCHE':
            return process.env.NEXT_PUBLIC_AVALANCHE_RPC_URL || '';
        case 'POLYGON':
            return process.env.NEXT_PUBLIC_POLYGON_RPC_URL || '';
        case 'BLAST':
            return process.env.NEXT_PUBLIC_BLAST_RPC_URL || '';
        case 'ABSTRACT':
            return process.env.NEXT_PUBLIC_ABSTRACT_RPC_URL || '';
        case 'OPTIMISM':
            return process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL || '';
        default:
            throw new Error(`No RPC URL found for chain ${chain}`);
    }
};