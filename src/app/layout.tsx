// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { QueryProvider } from "@/components/providers/query-provider";
// import { Toaster } from "@/components/ui/toaster";
import { Toaster } from "@/components/ui/sonner"

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TaskFlow — Team Task Manager",
  description: "Manage projects and tasks with your team",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={geist.className}>
        <AuthSessionProvider>
          <QueryProvider>
            {children}
            <Toaster
              theme="dark"
              richColors
              position="top-right"
              closeButton
            />
          </QueryProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}