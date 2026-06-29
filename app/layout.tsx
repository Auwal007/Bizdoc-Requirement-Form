import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Bizdoc — Business Registration",
  description: "Professional business registration services. Company Limited, Business Name, and Incorporation of Trustees — handled with precision.",
  keywords: ["business registration", "company incorporation", "CAC", "Nigeria", "Bizdoc", "Hamzury"],
  openGraph: {
    title: "Bizdoc — Business Registration",
    description: "We handle CAC so you can handle business.",
    siteName: "Bizdoc by Hamzury",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="font-sans bizdoc-page">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
