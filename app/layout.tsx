import type { Metadata } from "next";
import "./globals.css";
import { WatchlistProvider } from "@/contexts/WatchlistContext";
import KeyboardNav from "@/components/KeyboardNav";

export const metadata: Metadata = {
  title: "What2Watch",
  description: "Find your next movie or series to watch",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#0d1117] text-[#f0f6fc]">
        <WatchlistProvider>
          <KeyboardNav />
          {children}
        </WatchlistProvider>
      </body>
    </html>
  );
}
