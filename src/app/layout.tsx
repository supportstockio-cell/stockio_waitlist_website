import type { Metadata } from "next";
import { Big_Shoulders, Chivo, Martian_Mono } from "next/font/google";
import "./globals.css";

// Condensed, architectural, tall: the headline face is doing skyline work.
const bigShoulders = Big_Shoulders({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  fallback: ["Arial Narrow", "Helvetica Neue", "sans-serif"],
});

const chivo = Chivo({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Reserved for tickers, step numbers and eyebrows, where mono is the market's
// own idiom rather than decoration.
const martianMono = Martian_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Stockio: build a city powered by the real stock market",
  description:
    "Call the market, earn points for accuracy, and acquire buildings modeled on real companies. Your city rises and falls with the real market. No real money, all the stakes. Join the Stockio waitlist.",
  metadataBase: new URL("https://stockio.app"),
  openGraph: {
    title: "Stockio: build a city powered by the real stock market",
    description:
      "No real money, all the stakes. Join the waitlist for early access.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bigShoulders.variable} ${chivo.variable} ${martianMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
