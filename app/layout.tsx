export const metadata = {
  title: 'OLEDNIME',
  description: 'Aplikasi Streaming Anime OLED Dark Mode',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
