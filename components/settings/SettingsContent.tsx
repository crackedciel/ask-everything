"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Button from "@/components/ui/Button";
import { useUpProvider } from "@/components/upProvider";
import { encodeERC725YSetData, ERC725Y_ABI, getDataKey } from "@/lib/blockchain";
import { createPublicClient, http } from "viem";
import { lukso, luksoTestnet } from "viem/chains";

export function SettingsContent() {
  const router = useRouter();
  const [agentContext, setAgentContext] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { accounts, client, chainId } = useUpProvider();

  // Load context from both localStorage and blockchain
  useEffect(() => {
    async function loadContext() {
      setIsLoading(true);
      try {
        // First load from localStorage 
        const localContext = localStorage.getItem("agentContext") || "";
        setAgentContext(localContext);
        
        // Then try to load from blockchain if account is available
        if (accounts?.[0]) {
          const publicClient = createPublicClient({
            chain: chainId === 42 ? lukso : luksoTestnet,
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
              const dataString = dataKey ? new TextDecoder().decode(dataKey as Uint8Array) : '';
              if (dataString && dataString.trim()) {
                console.log("Loaded context from blockchain:", dataString);
                setAgentContext(dataString);
                localStorage.setItem("agentContext", dataString);
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
      // Save to localStorage
      localStorage.setItem("agentContext", agentContext);
      console.log('before here')
      console.log(client)
      console.log(accounts)
      // If we have an account and client, save to blockchain
      if (accounts?.[0] && client) {
        console.log('jhere');

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
      }
      
      router.back();
    } catch (error) {
      console.error("Error saving context:", error);
      alert("Failed to save context to blockchain");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-5xl mx-auto p-4">
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 mr-2 rounded-full hover:bg-zinc-800"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-semibold">Agent Settings</h1>
      </div>

      <div className="flex-1">
        <label className="block mb-2 text-sm font-medium text-gray-300">
          Agent Context
        </label>
        {isLoading ? (
          <div className="w-full h-64 flex items-center justify-center bg-zinc-900 border border-zinc-700 rounded-md">
            <span className="animate-spin h-6 w-6 border-t-2 border-b-2 border-white rounded-full mr-2"></span>
            <span>Loading context...</span>
          </div>
        ) : (
          <textarea
            value={agentContext}
            onChange={(e) => setAgentContext(e.target.value)}
            className="w-full h-64 p-3 bg-zinc-900 border border-zinc-700 rounded-md text-white resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Enter context information for the agent..."
          />
        )}
        <p className="mt-2 text-xs text-gray-400">
          This context will be stored on your Universal Profile as ERC725Y data.
        </p>
      </div>

      <div className="mt-4">
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