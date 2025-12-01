import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Business AI Assistant - Generative UI',
  description: 'AI-powered business automation dashboard with natural language commands, dynamic charts, and real-time insights',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
