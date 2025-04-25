'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './Navbar.module.css'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link href="/">Logo</Link>
      </div>

      <div className={styles.navItems}>
        {/* Desktop Navigation */}
        <div className={styles.navLinks}>
          <Link href="/" className={pathname === '/' ? 'font-bold' : ''}>
            Home
          </Link>
          <Link href="/about" className={pathname === '/about' ? 'font-bold' : ''}>
            About
          </Link>
          <Link href="/contact" className={pathname === '/contact' ? 'font-bold' : ''}>
            Contact
          </Link>
        </div>

        {/* Auth Navigation */}
        <div className={styles.loginContainer}>
          {session ? (
            <button onClick={handleLogout} className="cursor-pointer">
              Logout
            </button>
          ) : (
            <Link href="/auth/login" className="cursor-pointer">
              Login
            </Link>
          )}
        </div>

        {/* Hamburger for Mobile */}
        <div className={styles.hamburger} onClick={toggleMenu}>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.open : ''}`}>
        <Link href="/" onClick={closeMenu}>
          Home
        </Link>
        <Link href="/about" onClick={closeMenu}>
          About
        </Link>
        <Link href="/contact" onClick={closeMenu}>
          Contact
        </Link>
        <div className="relative py-2 px-6">
          {session ? (
            <button onClick={handleLogout} className="cursor-pointer">
              Logout
            </button>
          ) : (
            <Link href="/auth/login" onClick={closeMenu} className="cursor-pointer">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar