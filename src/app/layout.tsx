import type { Metadata } from "next";
import { Bodoni_Moda, Manrope } from "next/font/google";
import "./globals.css";

const bodoniModa = Bodoni_Moda({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  style: ["normal", "italic"],
});

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Stockio — Build a city powered by the real stock market",
  description:
    "Predict daily. Acquire real-company buildings with points. Watch your city rise and fall with the actual market. No real money, all the stakes. Join the Stockio waitlist.",
  metadataBase: new URL("https://stockio.app"),
  openGraph: {
    title: "Stockio — Build a city powered by the real stock market",
    description:
      "No real money, all the stakes. Join the waitlist for early access.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bodoniModa.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
