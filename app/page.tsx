"use client";

import { Chat } from "@/components/Chat";
import { useState, useEffect } from "react";

// Import the LUKSO web-components library
let promise: Promise<unknown> | null = null;
if (typeof window !== "undefined") {
  promise = import("@lukso/web-components");
}

/**
 * Main content component that handles the conditional rendering of Donate and ProfileSearch components.
 * Utilizes the UpProvider context to manage selected addresses and search state.
 *
 * @component
 * @returns {JSX.Element} A component that toggles between Donate and ProfileSearch views
 * based on the isSearching state from UpProvider.
 */
function MainContent() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load web component here if needed
    promise?.then(() => {
      setMounted(true);
    });
  }, []);

  if (!mounted) {
    return null; // or a loading placeholder
  }

  return (
    
        <Chat />
  );
}

/**
 * Root component of the application that wraps the main content with the UpProvider context.
 * Serves as the entry point for the donation and profile search functionality.
 *
 * @component
 * @returns {JSX.Element} The wrapped MainContent component with UpProvider context
 */
export default function Home() {
  return (
    <MainContent />
  );
}
