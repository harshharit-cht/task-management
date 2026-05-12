// src/app/layout.tsx
import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { QueryProvider } from "@/components/providers/query-provider";
// import { Toaster } from "@/components/ui/toaster";
import { Toaster } from "@/components/ui/sonner"

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "Ethara Flow",
  description: "Manage projects and tasks with your team",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={manrope.className}>
        <AuthSessionProvider>
          <QueryProvider>
            {children}
            <Toaster
              theme="dark"
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "#13131f",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#e2e8f0",
                },
              }}
            />
          </QueryProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}