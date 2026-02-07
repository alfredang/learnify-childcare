import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/providers"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: {
    default: "Learnify - Childcare Professional Development",
    template: "%s | Learnify",
  },
  description:
    "Professional development e-learning platform for early childhood educators. SCORM-compliant CPD courses for childcare professionals in Singapore.",
  keywords: [
    "childcare",
    "early childhood",
    "CPD",
    "professional development",
    "e-learning",
    "ECDA",
    "Singapore",
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
