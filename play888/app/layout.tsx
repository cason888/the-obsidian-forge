import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ConvexClientProvider from "./ConvexClientProvider";
import { StickyHeader } from "@/components/layout/sticky-header";
import { StickyFooter } from "@/components/layout/sticky-footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "My App Title",
  description: "My app description",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StickyHeader className="p-2">Sticky header</StickyHeader>
        <ConvexClientProvider>
          <main className="min-h-[calc(100vh-(5rem+2px))]">
            {children}
          </main>
        </ConvexClientProvider>
        <StickyFooter className="p-2">Sticky footer</StickyFooter>
      </body>
    </html>
  );
}