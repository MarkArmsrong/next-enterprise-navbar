import "styles/tailwind.css"
import Navbar from "../components/Navbar/Navbar"
import AuthProvider from "../components/AuthProvider"

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
