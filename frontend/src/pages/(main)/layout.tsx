"use client";

import { AppProvider } from "../providers/AppProvider";
import { ClientOnlyMainLayout } from "./client-layout";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProvider>
      <ClientOnlyMainLayout>{children}</ClientOnlyMainLayout>
    </AppProvider>
  );
}
