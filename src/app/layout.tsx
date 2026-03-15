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
  metadataBase: new URL("https://costwise.usa-net-zero.com"),
  title: {
    default:
      "CostWise – Cost of Living Comparison Calculator for US Cities & States (2026)",
    template: "%s | CostWise",
  },
  description:
    "Compare cost of living across 6,000+ US cities and all 50 states. Calculate salary equivalents, compare housing costs, rent prices, state income taxes, groceries, utilities, healthcare, and transportation — powered by Census Bureau, BEA, HUD, BLS, and PayScale data. Find the cheapest and most affordable cities and states to live in America in 2026.",
  keywords: [
    "cost of living comparison",
    "cost of living calculator",
    "cost of living index by city",
    "cost of living by state",
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
    "cheapest states to live in US",
    "most affordable cities USA 2026",
    "most affordable states USA 2026",
    "affordable cities USA",
    "rent comparison by city",
    "average cost of living in arizona",
    "average cost of living in las vegas",
    "cost of living index",
    "salary equivalent calculator",
    "wages vs cost of living",
    "cost of living vs income",
    "best cities to live in US",
    "best states to retire in",
    "housing affordability by city",
    "state income tax comparison",
    "no income tax states",
    "cost of living in california",
    "cost of living in florida",
    "cost of living in texas",
    "cost of living in new york",
    "cost of living in colorado",
    "cost of living in washington",
    "cost of living in north carolina",
    "cost of living in tennessee",
    "median rent by city",
    "median home price by state",
    "grocery prices by city",
    "healthcare costs by city",
    "utility costs comparison",
    "relocation cost calculator",
    "moving cost comparison",
  ],
  authors: [{ name: "CostWise" }],
  openGraph: {
    title: "CostWise – US Cost of Living Comparison Tool (6,000+ Cities)",
    description:
      "Compare cost of living across 6,000+ US cities and all 50 states. Find salary equivalents, compare housing, rent, taxes, groceries, healthcare, and more.",
    type: "website",
    locale: "en_US",
    siteName: "CostWise",
    url: "https://costwise.usa-net-zero.com",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CostWise – US Cost of Living Comparison Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.png"],
    title: "CostWise – US Cost of Living Comparison Tool",
    description:
      "Compare cost of living across 6,000+ US cities and all 50 states. Find salary equivalents, compare housing, taxes, and lifestyle.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://costwise.usa-net-zero.com",
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "CostWise",
              url: "https://costwise.usa-net-zero.com",
              description:
                "Compare cost of living across 6,000+ US cities and all 50 states. Calculate salary equivalents, compare housing costs, rent, taxes, groceries, and more.",
              applicationCategory: "FinanceApplication",
              operatingSystem: "All",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              creator: {
                "@type": "Organization",
                name: "CostWise",
                url: "https://costwise.usa-net-zero.com",
              },
            }),
          }}
        />
      </head>
      <body className={`${openSans.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
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
