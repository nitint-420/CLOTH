import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
// import { ClerkProvider } from "@clerk/nextjs";
const inter = Inter({ subsets: ["latin"] });
export const metadata: Metadata = { title: "Grocery Store Dashboard" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          {children}
          <Toaster position="top-right" toastOptions={{ duration: 3000, style: { background: "#333", color: "#fff" } }} />
        </body>
      </html>
    // </ClerkProvider>
  );
}
