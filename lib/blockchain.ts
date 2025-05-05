import { createPublicClient, http, encodeFunctionData, Hex, keccak256, toHex } from "viem";
import { lukso, luksoTestnet } from "viem/chains";

// ERC725Y interface ABI for the setData function
export const ERC725Y_ABI = [
  {
    inputs: [
      { name: "dataKey", type: "bytes32" },
      { name: "dataValue", type: "bytes" }
    ],
    name: "setData",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "dataKey", type: "bytes32" }
    ],
    name: "getData",
    outputs: [
      { name: "dataValue", type: "bytes" }
    ],
    stateMutability: "view",
    type: "function",
  }
] as const;

// Create a client for read-only operations
export const getPublicClient = (chainId: number) => {
  return createPublicClient({
    chain: chainId === 42 ? lukso : luksoTestnet,
    transport: http(),
  });
};

// Calculate keccak256 hash for a string key
export const getDataKey = (key: string): Hex => {
  // Use viem's keccak256 function to properly hash the key to a bytes32 value
  return keccak256(toHex(key));
};

// Helper to encode data for ERC725Y setData transaction
export const encodeERC725YSetData = (key: string, value: string): Hex => {
  // Hash the key to create a proper bytes32 value
  const dataKey = getDataKey(key);
  
  // Convert the string to bytes
  const valueBytes = `0x${Buffer.from(value).toString("hex")}` as Hex;
  
  return encodeFunctionData({
    abi: ERC725Y_ABI,
    functionName: "setData",
    args: [dataKey, valueBytes],
  });
};