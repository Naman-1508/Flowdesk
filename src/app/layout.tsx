import type { Metadata } from "next";
import { Syne, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { HotkeyProvider } from "@/components/layout/HotkeyProvider";
import { AuthProvider } from "@/components/AuthProvider";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "FlowDesk",
  description: "Stop switching. Start shipping.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${syne.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased min-h-screen bg-bg text-text selection:bg-accent/30 flex flex-col">
        <AuthProvider>
          <ConvexClientProvider>
            <HotkeyProvider>{children}</HotkeyProvider>
          </ConvexClientProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
