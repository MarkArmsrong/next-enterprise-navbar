'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import styles from './Navbar.module.css'
import { usePathname } from 'next/navigation'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false)
  const loginDropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const toggleLoginDropdown = () => {
    setIsLoginDropdownOpen(!isLoginDropdownOpen)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        loginDropdownRef.current && 
        !loginDropdownRef.current.contains(event.target as Node)
      ) {
        setIsLoginDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

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

        {/* Login Dropdown (Desktop) */}
        <div className={styles.loginContainer} ref={loginDropdownRef}>
          <button 
            onClick={toggleLoginDropdown}
            className="cursor-pointer"
          >
            Login
          </button>
          
          {isLoginDropdownOpen && (
            <div className="absolute right-0 mt-2 bg-white p-2 rounded shadow-md min-w-32 z-10">
              <div className="p-2 cursor-pointer hover:bg-gray-100 rounded">
                <Link href="/login/google" className="block w-full">
                  Login with Google
                </Link>
              </div>
              <div className="p-2 cursor-pointer hover:bg-gray-100 rounded">
                <Link href="/login/git" className="block w-full">
                  Login with Git
                </Link>
              </div>
              <div className="p-2 cursor-pointer hover:bg-gray-100 rounded">
                <Link href="/login/facebook" className="block w-full">
                  Login with Facebook
                </Link>
              </div>
            </div>
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
          <button 
            onClick={toggleLoginDropdown}
            className="cursor-pointer"
          >
            Login
          </button>
          
          {isLoginDropdownOpen && (
            <div className="absolute left-6 mt-2 bg-white p-2 rounded shadow-md min-w-32 z-10">
              <div className="p-2 cursor-pointer hover:bg-gray-100 rounded">
                <Link href="/login/google" className="block w-full" onClick={closeMenu}>
                  Login with Google
                </Link>
              </div>
              <div className="p-2 cursor-pointer hover:bg-gray-100 rounded">
                <Link href="/login/git" className="block w-full" onClick={closeMenu}>
                  Login with Git
                </Link>
              </div>
              <div className="p-2 cursor-pointer hover:bg-gray-100 rounded">
                <Link href="/login/facebook" className="block w-full" onClick={closeMenu}>
                  Login with Facebook
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar