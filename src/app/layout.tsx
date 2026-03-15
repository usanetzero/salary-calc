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
    default:
      "CostWise – Cost of Living Comparison Calculator for US Cities (2025)",
    template: "%s | CostWise",
  },
  description:
    "Compare cost of living across 50+ US cities including Arizona, Las Vegas, Montana, and more. Calculate salary equivalents, compare housing costs, rent prices, state taxes, groceries, utilities — powered by Census Bureau, BEA, HUD, and BLS data. Find the cheapest and most affordable cities to live in America.",
  keywords: [
    "cost of living comparison",
    "cost of living calculator",
    "cost of living index by city",
    "cost of living in arizona",
    "cost of living in las vegas",
    "montana cost of living",
    "cost of living in vermont",
    "rhode island cost of living",
    "naples florida cost of living",
    "bay area cost of living",
    "bend oregon cost of living",
    "salary calculator by city",
    "salary adjustment calculator",
    "compare salaries between cities",
    "cheapest cities to live in US",
    "cheapest cities to live in America",
    "most affordable cities USA 2025",
    "affordable cities USA",
    "rent comparison by city",
    "average cost of living in arizona",
    "average cost of living in las vegas",
    "cost of living index",
    "salary equivalent calculator",
    "wages vs cost of living",
    "cost of living vs income",
    "best cities to live in US",
    "housing affordability by city",
    "state income tax comparison",
    "cost of living in california",
    "cost of living in florida",
    "cost of living in texas",
    "cost of living in new york",
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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
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
