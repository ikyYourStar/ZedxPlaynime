import './globals.css'

export const metadata = {
  title: 'ZedxPlay',
  description: 'OLED Dark Mode Anime Streaming',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className="no-scrollbar">
      <body className="antialiased no-scrollbar">{children}</body>
    </html>
  )
}
