import { Instrument_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata = {
  title: "UBIT Study Hub",
  description: "Crowdsourced study resources for UBIT students",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${instrumentSans.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}