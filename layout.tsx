import './globals.css'

export const metadata = {
  title: 'AI Studio',
  description: 'Chat and Image Generation App',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white">
        {children}
      </body>
    </html>
  )
}    
