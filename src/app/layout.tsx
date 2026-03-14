import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { QueryProvider } from "@/components/QueryProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CostWise – US Cost of Living Comparison Tool",
    template: "%s | CostWise",
  },
  description:
    "Compare cost of living across 50+ US cities. Find salary equivalents, compare housing, taxes, and lifestyle — powered by Census Bureau, BEA, HUD, and BLS data.",
  keywords: [
    "cost of living comparison",
    "cost of living calculator",
    "cost of living index by city",
    "salary calculator by city",
    "salary adjustment calculator",
    "compare salaries between cities",
    "cheapest cities to live in US",
    "cheapest cities to live in America",
    "affordable cities USA",
    "rent comparison by city",
    "cost of living index",
    "salary equivalent calculator",
    "best cities to live in US",
    "moving cost calculator",
    "housing affordability by city",
    "state income tax comparison",
  ],
  authors: [{ name: "CostWise" }],
  openGraph: {
    title: "CostWise – US Cost of Living Comparison Tool",
    description:
      "Compare cost of living across 50+ US cities. Find salary equivalents, compare housing, taxes, and lifestyle.",
    type: "website",
    locale: "en_US",
    siteName: "CostWise",
  },
  twitter: {
    card: "summary_large_image",
    title: "CostWise – US Cost of Living Comparison Tool",
    description:
      "Compare cost of living across 50+ US cities. Find salary equivalents, compare housing, taxes, and lifestyle.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${openSans.variable} font-sans antialiased`}>
        <ThemeProvider>
          <QueryProvider>
            <TooltipProvider>
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
              <Toaster />
            </TooltipProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
