import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "Leher Adventure | Petualangan Gunung Indonesia",
    template: "%s | Leher Adventure",
  },
  description: "Leher Adventure - Komunitas petualangan gunung di Indonesia. Jelajahi jejak ekspedisi kami dan bergabunglah dalam petualangan berikutnya.",
  keywords: ["Leher Adventure", "petualangan gunung", "ekspedisi Indonesia", "hiking", "mountaineering", "outdoor", "pendakian", "gunung Indonesia"],
  authors: [{ name: "Leher Adventure" }],
  creator: "Leher Adventure",
  publisher: "Leher Adventure",
  metadataBase: new URL("https://leher-adventure.org"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Leher Adventure | Petualangan Gunung Indonesia",
    description: "Komunitas petualangan gunung di Indonesia. Jelajahi jejak ekspedisi kami dan bergabunglah dalam petualangan berikutnya.",
    url: "https://leher-adventure.org",
    siteName: "Leher Adventure",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/images/hero.png",
        width: 1200,
        height: 630,
        alt: "Leher Adventure - Petualangan Gunung Indonesia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Leher Adventure | Petualangan Gunung Indonesia",
    description: "Komunitas petualangan gunung di Indonesia. Jelajahi jejak ekspedisi kami.",
    images: ["/images/hero.png"],
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
  icons: {
    icon: "/images/logo-leher.png",
    shortcut: "/images/logo-leher.png",
    apple: "/images/logo-leher.png",
    other: {
      rel: "apple-touch-icon",
      url: "/images/logo-leher.png",
    },
  },
  verification: {
    google: "google-site-verification-code", // Ganti dengan kode verifikasi Google Search Console
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2b4d59",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
