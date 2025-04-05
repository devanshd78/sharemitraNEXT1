import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import Navbar from "./Navbar";
import { headers } from "next/headers";

const lexend = Lexend({
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "ShareMitra",
  description: "ShareMitra App",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Await the headers since headers() returns a Promise
  const reqHeaders = await headers();
  // Attempt to get the IP address from the 'x-forwarded-for' header
  const forwarded = reqHeaders.get("x-forwarded-for");
  // Use the first IP if multiple are provided; otherwise, fall back to 'x-real-ip'
  const ip = forwarded ? forwarded.split(",")[0] : reqHeaders.get("x-real-ip") || "unknown";
  console.log("IP", ip);

  // Retrieve userId from cookies (update key as needed)
  const cookieHeader = reqHeaders.get("cookie") || "";
  const userIdMatch = cookieHeader.match(/userId=([^;]+)/);
  const userId = userIdMatch ? userIdMatch[1] : null;

  let walletBalance = 0;
  if (userId) {
    try {
      const res = await fetch(`http://127.0.0.1:5000/wallet/info?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        walletBalance = data.remaining_balance || 0;
      } else {
        console.error("Error fetching wallet info:", res.statusText);
      }
    } catch (error) {
      console.error("Error fetching wallet info:", error);
    }
  }

  return (
    <html lang="en">
      <body className={`${lexend.className} antialiased`}>
        <Script
          strategy="beforeInteractive"
          src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY}`}
        />
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-kenU1KFdBIe4zVF0s0G1M5b4hcpxyD9F7jL+4WJYMWc9G3hS7W1z1JvoRxT2MZw1T"
          crossOrigin="anonymous"
        />
        {/* Pass the walletBalance as a prop to Navbar */}
        <Navbar walletBalance={walletBalance} />
        <main className={`${lexend.className} antialiased`}>{children}</main>
      </body>
    </html>
  );
}
