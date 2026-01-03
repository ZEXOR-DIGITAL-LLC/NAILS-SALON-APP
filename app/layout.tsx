import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nails Salon - Booking App for Nail Techs | Join the Waitlist",
  description: "The simplest way for nail techs to organize bookings, clients, and designs in one place. Stop living inside WhatsApp all day. Join our waitlist for early access.",
  keywords: ["nail tech software", "nail salon booking", "nail appointment app", "manicure booking system", "nail client management"],
  icons: {
    icon: "/nails-salon.svg",
  },
  openGraph: {
    title: "Nails Salon - Booking App for Nail Techs",
    description: "The simplest way for nail techs to organize bookings, clients, and designs in one place.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
