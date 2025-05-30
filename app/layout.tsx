import "styles/tailwind.css"
import AuthProvider from "../components/AuthProvider"
import Navbar from "../components/Navbar/Navbar"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
