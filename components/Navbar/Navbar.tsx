"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { useState } from "react"
import styles from "./Navbar.module.css"

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()

  // Get the appropriate display name
  const getDisplayName = () => {
    if (!session?.user) return ""
    
    // Just use the name from the session
    return session.user.name || ""
  }

  // Get the appropriate profile image
  const getProfileImage = () => {
    if (!session?.user) return null

    // Return the image from the session
    return session.user.image || null
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
    await signOut({ redirect: true, callbackUrl: "/" })
  }

  // Profile image to display
  const profileImage = getProfileImage()
  const userName = session?.user?.name || ""

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link href="/">Logo</Link>
      </div>

      <div className={styles.navItems}>
        {/* Desktop Navigation */}
        <div className={styles.navLinks}>
          <Link href="/" className={pathname === "/" ? "font-bold" : ""}>
            Home
          </Link>
          <Link href="/about" className={pathname === "/about" ? "font-bold" : ""}>
            About
          </Link>
          <Link href="/contact" className={pathname === "/contact" ? "font-bold" : ""}>
            Contact
          </Link>
        </div>

        {/* Auth Navigation */}
        <div className={styles.loginContainer}>
          {session ? (
            <div className={styles.userProfile}>
              <div className={styles.profileButton} onClick={toggleProfileDropdown}>
                {profileImage ? (
                  <Image src={profileImage} alt={userName} width={32} height={32} className={styles.profileImage} />
                ) : (
                  <div className={styles.profileImagePlaceholder}>{userName?.charAt(0) || "?"}</div>
                )}
                <span className={styles.userName}>{getDisplayName()}</span>
              </div>

              {isProfileDropdownOpen && (
                <div className={styles.profileDropdown} onMouseLeave={closeProfileDropdown}>
                  <div className={styles.profileInfo}>
                    <div className={styles.profileImageContainer}>
                      {profileImage ? (
                        <Image
                          src={profileImage}
                          alt={userName}
                          width={48}
                          height={48}
                          className={styles.profileImageLarge}
                        />
                      ) : (
                        <div className={styles.profileImagePlaceholderLarge}>{userName?.charAt(0) || "?"}</div>
                      )}
                    </div>
                    <div className={styles.profileName}>{getDisplayName()}</div>
                    <div className={styles.profileEmail}>{session.user?.email}</div>
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
      <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.open : ""}`}>
        <Link href="/" onClick={closeMenu}>
          Home
        </Link>
        <Link href="/about" onClick={closeMenu}>
          About
        </Link>
        <Link href="/contact" onClick={closeMenu}>
          Contact
        </Link>
        <div className="relative px-6 py-2">
          {session ? (
            <div className={styles.mobileUserProfile}>
              {profileImage ? (
                <Image src={profileImage} alt={userName} width={24} height={24} className={styles.mobileProfileImage} />
              ) : (
                <div className={styles.mobileProfileImagePlaceholder}>{userName?.charAt(0) || "?"}</div>
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
