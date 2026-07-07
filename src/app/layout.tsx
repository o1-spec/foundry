import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Foundry — Collaborative AI Agent Pipeline Platform",
    template: "%s | Foundry"
  },
  description:
    "Foundry is a premium collaborative AI agent runner built for sub-second cost optimization. Design objectives, configure specialist roles, and launch autonomous execution loops powered by the BTL Runtime.",
  keywords: [
    "AI Agent Runner", 
    "Multi-Agent Pipelines", 
    "BTL Runtime Integration", 
    "Shared-Savings Billing", 
    "Foundry AI", 
    "Autonomous Task Execution"
  ],
  authors: [{ name: "Foundry Team" }],
  openGraph: {
    title: "Foundry — Collaborative AI Agent Platform",
    description: "Design objectives, assemble specialist agents, and run optimized execution loops on BTL Runtime.",
    url: "https://foundry-nu-amber.vercel.app",
    siteName: "Foundry",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Foundry — Collaborative AI Agent Platform",
    description: "Run autonomous multi-agent pipelines with native BTL cost-saving optimizations.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable} ${playfair.variable} h-full`}>
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}
