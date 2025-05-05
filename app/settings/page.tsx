"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Button from "@/components/ui/Button";

export default function SettingsPage() {
  const router = useRouter();
  const [agentContext, setAgentContext] = useState("");

  // Load context from localStorage on mount
  useEffect(() => {
    const savedContext = localStorage.getItem("agentContext") || "";
    setAgentContext(savedContext);
  }, []);

  const handleSave = () => {
    localStorage.setItem("agentContext", agentContext);
    router.back();
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
        <textarea
          value={agentContext}
          onChange={(e) => setAgentContext(e.target.value)}
          className="w-full h-64 p-3 bg-zinc-900 border border-zinc-700 rounded-md text-white resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Enter context information for the agent..."
        />
      </div>

      <div className="mt-4">
        <Button onClick={handleSave} className="w-full flex items-center justify-center">
          <Save size={18} className="mr-2" />
          Save Context
        </Button>
      </div>
    </div>
  );
}