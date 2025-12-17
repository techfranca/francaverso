import './globals.css'

export const metadata = {
  title: 'Francaverso | Portal Franca',
  description: 'Plataforma centralizada de ferramentas e sistemas da Franca',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
