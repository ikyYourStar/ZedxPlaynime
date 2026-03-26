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
    <html lang="id">
      <body>
        {/* INI KUNCI UTAMANYA: Pindahin sistem scroll dari layar HP ke dalam kotak Div ini */}
        <div className="h-screen w-screen overflow-y-auto overflow-x-hidden no-scrollbar bg-black relative">
          {children}
        </div>
      </body>
    </html>
  )
}
