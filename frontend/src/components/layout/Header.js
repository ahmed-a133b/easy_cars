"use client"

import { useContext, useState, useEffect } from "react"
import { Link, useHistory, useLocation } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"
import { ThemeContext } from "../../context/ThemeContext"
import ThemeToggle from "./ThemeToggle"
import Button from "../ui/Button"
import "./Header.css"

const Header = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext)
  const { darkMode } = useContext(ThemeContext)
  const history = useHistory()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activePath, setActivePath] = useState("/")

  useEffect(() => {
    setActivePath(location.pathname)
    // Close menu when route changes
    if (isMenuOpen) {
      setIsMenuOpen(false)
    }
  }, [location])

  useEffect(() => {
    // Close menu when clicking outside
    const handleClickOutside = (event) => {
      const nav = document.querySelector('.nav')
      const menuToggle = document.querySelector('.menu-toggle')
      
      if (isMenuOpen && nav && !nav.contains(event.target) && !menuToggle.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  const handleLogout = async () => {
    await logout()
    history.push("/")
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const isActive = (path) => {
    if (path === "/") {
      return activePath === path
    }
    return activePath.startsWith(path)
  }

  return (
    <header className={`header ${darkMode ? "dark" : "light"}`}>
      <div className="container">
        <div className="header-content">
          <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle menu">
            <span className={`menu-icon ${isMenuOpen ? 'open' : ''}`}>☰</span>
          </button>
          
          <div className="logo">
            <Link to="/">
              <h1>Easy Cars</h1>
            </Link>
          </div>
          
          <nav className={`nav ${isMenuOpen ? "active" : ""}`}>
            <ul className="nav-links">
              <li>
                <Link 
                  to="/" 
                  onClick={() => setIsMenuOpen(false)} 
                  className={isActive("/") ? "active" : ""}
                >
                  🏠Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/cars" 
                  onClick={() => setIsMenuOpen(false)} 
                  className={isActive("/cars") ? "active" : ""}
                >
                  🚗Cars
                </Link>
              </li>
              <li>
                <Link 
                  to="/dealerships" 
                  onClick={() => setIsMenuOpen(false)} 
                  className={isActive("/dealerships") ? "active" : ""}
                >
                  🏢Dealerships
                </Link>
              </li>
              <li>
                <Link 
                  to="/forum" 
                  onClick={() => setIsMenuOpen(false)} 
                  className={isActive("/forum") ? "active" : ""}
                >
                  💬Forum
                </Link>
              </li>
              {isAuthenticated && user?.role === "admin" && (
                <li>
                  <Link 
                    to="/admin" 
                    onClick={() => setIsMenuOpen(false)} 
                    className={isActive("/admin") ? "active" : ""}
                  >
                    👮Admin
                  </Link>
                </li>
              )}
            </ul>
          </nav>
          
          <div className="header-actions">
            <ThemeToggle />
            {isAuthenticated ? (
              <div className="user-menu">
                <Link to="/profile" className="user-profile">
                  {user?.name}
                </Link>
                <div className="user-menu-actions">
                  <Link to="/dashboard">
                    <Button variant="outline" size="small">
                      🔍Dashboard
                    </Button>
                  </Link>
                  <Button variant="secondary" size="small" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login">
                  <Button variant="secondary" size="small">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="small">Register</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile overlay for the menu */}
      {isMenuOpen && <div className="menu-overlay" onClick={toggleMenu}></div>}
    </header>
  )
}

export default Header
