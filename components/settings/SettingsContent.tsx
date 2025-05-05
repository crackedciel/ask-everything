"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Button from "@/components/ui/Button";
import { useUpProvider } from "@/components/upProvider";
import { encodeERC725YSetData, ERC725Y_ABI, getDataKey } from "@/lib/blockchain";
import { createPublicClient, http } from "viem";
import { lukso } from "viem/chains";
import {toUtf8String} from "ethers";

export function SettingsContent() {
  const router = useRouter();
  const [agentContext, setAgentContext] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { accounts, client, chainId } = useUpProvider();

  // Load context only from blockchain
  useEffect(() => {
    async function loadContext() {
      setIsLoading(true);
      try {
        // Only load from blockchain if account is available
        if (accounts?.[0]) {
          const publicClient = createPublicClient({
            chain: lukso,
            transport: http(),
          });
          
          try {
            // Create the data key for "assistant_prompt" using the same hash function
            const dataKey = await publicClient.readContract({
              address: accounts[0],
              abi: ERC725Y_ABI,
              functionName: 'getData',
              args: [getDataKey("assistant_prompt")],
            });
            
            if (dataKey) {
              // Convert bytes to string
              console.log("Data key found:", dataKey);
              const dataString = toUtf8String(dataKey);
              if (dataString && dataString.trim()) {
                console.log("Loaded context from blockchain:", dataString);
                setAgentContext(dataString);
              }
            }
          } catch (error) {
            console.log("No blockchain context found:", error);
          }
        }
      } catch (error) {
        console.error("Error loading context:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadContext();
  }, [accounts, chainId]);

  const handleSave = async () => {
    try {
      // If we have an account and client, save to blockchain
      if (accounts?.[0] && client) {
        setIsSaving(true);
        
        // Prepare transaction data
        const data = encodeERC725YSetData("assistant_prompt", agentContext);
        
        // Send transaction
        const hash = await client.sendTransaction({
          account: accounts[0],
          to: accounts[0],
          data,
          chain: lukso
        });
        
        console.log("Transaction sent:", hash);
        
        // Wait for a brief moment to ensure transaction is processed
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        router.back();
      } else {
        alert("Account or client not available. Cannot save to blockchain.");
      }
    } catch (error) {
      console.error("Error saving context:", error);
      alert("Failed to save context to blockchain");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-5xl mx-auto">
      <div className="flex items-center p-4 mb-2 bg-gray-900/60 backdrop-blur-md border-b border-gray-800/60">
        <button
          onClick={() => router.back()}
          className="p-2 mr-3 rounded-full hover:bg-zinc-800/40 transition-colors"
        >
          <ArrowLeft size={22} className="text-gray-300" />
        </button>
        <h1 className="text-xl font-semibold text-gray-200">Agent Settings</h1>
      </div>

      <div className="flex-1 p-4 bg-gray-900/20 backdrop-blur-sm">
        <label className="block mb-2 text-sm font-medium text-gray-300">
          Agent Context
        </label>
        {isLoading ? (
          <div className="w-full h-64 flex items-center justify-center bg-gray-800/30 backdrop-blur-md border border-gray-700/40 rounded-lg">
            <span className="animate-spin h-6 w-6 border-t-2 border-b-2 border-white rounded-full mr-2"></span>
            <span>Loading context...</span>
          </div>
        ) : (
          <textarea
            value={agentContext}
            onChange={(e) => setAgentContext(e.target.value)}
            className="w-full h-64 p-3 bg-gray-800/30 backdrop-blur-md border border-gray-700/40 rounded-lg text-white resize-none focus:outline-none focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
            placeholder="Enter context information for the agent..."
          />
        )}
        <p className="mt-2 text-xs text-gray-400">
          This context will be stored on your Universal Profile as ERC725Y data.
        </p>
      </div>

      <div className="p-4 bg-gray-900/80 backdrop-blur-xl border-t border-zinc-800">
        <Button 
          onClick={handleSave} 
          className="w-full flex items-center justify-center"
          disabled={isSaving || isLoading}
        >
          {isSaving ? (
            <span className="flex items-center">
              <span className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></span>
              Saving...
            </span>
          ) : (
            <>
              <Save size={18} className="mr-2" />
              Save Context
            </>
          )}
        </Button>
      </div>
    </div>
  );
}