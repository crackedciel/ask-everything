"use client";

import { useState, useEffect } from "react";
import { createPublicClient, http } from "viem";
import { lukso, luksoTestnet } from "viem/chains";
import { ERC725Y_ABI, getDataKey } from "@/lib/blockchain";

export function useAgentContext(account: `0x${string}` | undefined, chainId: number) {
  const [agentContext, setAgentContext] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchAgentContext() {
      setIsLoading(true);
      setError(null);

      try {
        if (!account) {
          setAgentContext("");
          return;
        }

        const publicClient = createPublicClient({
          chain: lukso,
          transport: http(),
        });

        try {
          // Try to get the agent context from the blockchain
          // If this fails, the getData function might not be supported or no data exists
          try {
            const dataKey = await publicClient.readContract({
              address: account,
              abi: ERC725Y_ABI,
              functionName: 'getData',
              args: [getDataKey("assistant_prompt")],
            });
            
            if (dataKey) {
              // Convert bytes to string
              const dataString = new TextDecoder().decode(dataKey as Uint8Array);
              console.log("Agent context loaded:", dataString ? "has content" : "empty");
              setAgentContext(dataString.trim());
            } else {
              console.log("No agent context data exists yet");
              setAgentContext("");
            }
          } catch (err) {
            // This could happen if the address doesn't support ERC725Y or if data doesn't exist
            console.log("Unable to read agent context from blockchain (this is normal if it hasn't been set yet)");
            setAgentContext("");
          }
        } catch (err) {
          console.log("Error accessing blockchain:", err);
          setAgentContext("");
        }
      } catch (err) {
        console.error("Error fetching agent context:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setAgentContext("");
      } finally {
        setIsLoading(false);
      }
    }

    fetchAgentContext();
  }, [account, chainId]);

  return { agentContext, isLoading, error };
}