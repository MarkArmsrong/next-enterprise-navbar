'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import styles from './Navbar.module.css'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()

  // Get the appropriate display name based on the provider
  const getDisplayName = () => {
    if (!session?.user) return '';
    
    // If we have provider-specific name from the token, use it
    if (session.user.providerName) {
      return `${session.user.providerName} (${formatProviderName(session.user.provider)})`;
    }
    
    // Fallback to regular name
    return session.user.name || '';
  }
  
  // Format provider name for display
  const formatProviderName = (provider: string | undefined) => {
    if (!provider) return '';
    return provider.charAt(0).toUpperCase() + provider.slice(1);
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const closeProfileDropdown = () => {
    setIsProfileDropdownOpen(false)
  }

  const handleLogout = async () => {
    closeProfileDropdown()
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
            <div className={styles.userProfile}>
              <div 
                className={styles.profileButton}
                onClick={toggleProfileDropdown}
              >
                {session.user?.image ? (
                  <Image 
                    src={session.user.image} 
                    alt={session.user.name || "User"} 
                    width={32} 
                    height={32} 
                    className={styles.profileImage}
                  />
                ) : (
                  <div className={styles.profileImagePlaceholder}>
                    {session.user?.name?.charAt(0) || '?'}
                  </div>
                )}
                <span className={styles.userName}>{getDisplayName()}</span>
              </div>
              
              {isProfileDropdownOpen && (
                <div className={styles.profileDropdown} onMouseLeave={closeProfileDropdown}>
                  <div className={styles.profileInfo}>
                    <div className={styles.profileName}>{getDisplayName()}</div>
                    <div className={styles.profileEmail}>{session.user?.email}</div>
                    {session.user?.provider && (
                      <div className={styles.providerBadge}>
                        Signed in with {formatProviderName(session.user.provider)}
                      </div>
                    )}
                  </div>
                  <div className={styles.dropdownDivider}></div>
                  <button onClick={handleLogout} className={styles.logoutButton}>
                    Logout
                  </button>
                </div>
              )}
            </div>
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
            <div className={styles.mobileUserProfile}>
              {session.user?.image ? (
                <Image 
                  src={session.user.image} 
                  alt={session.user.name || "User"} 
                  width={24} 
                  height={24} 
                  className={styles.mobileProfileImage}
                />
              ) : (
                <div className={styles.mobileProfileImagePlaceholder}>
                  {session.user?.name?.charAt(0) || '?'}
                </div>
              )}
              <span className={styles.mobileUserName}>{getDisplayName()}</span>
              <button onClick={handleLogout} className={styles.mobileLogoutButton}>
                Logout
              </button>
            </div>
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