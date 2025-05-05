"use client";

import { UpProvider } from "@/components/upProvider";
import { Providers } from "../providers";

// Separate component that will be wrapped with providers
import { SettingsContent } from "@/components/settings/SettingsContent";

export default function SettingsPage() {
  return (

        <SettingsContent />

  );
}