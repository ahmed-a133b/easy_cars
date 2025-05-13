"use client"

import { useContext } from "react"
import { Link, useHistory } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"
import { ThemeContext } from "../../context/ThemeContext"
import ThemeToggle from "./ThemeToggle"
import Button from "../ui/Button"
import "./Header.css"

const Header = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext)
  const { darkMode } = useContext(ThemeContext)
  const history = useHistory()

  const handleLogout = async () => {
    await logout()
    history.push("/")
  }

  return (
    <header className={`header ${darkMode ? "dark" : "light"}`}>
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <Link to="/">
              <h1>Easy Cars</h1>
            </Link>
          </div>
          <nav className="nav">
            <ul className="nav-links">
              <li>
                <Link to="/">🏠Home</Link>
              </li>
              <li>
                <Link to="/cars">🚗Cars</Link>
              </li>
              <li>
                <Link to="/dealerships">🏢Dealerships</Link>
              </li>
              <li>
                <Link to="/forum">💬Forum</Link>
              </li>
              {isAuthenticated && user?.role === "admin" && (
                <li>
                  <Link to="/admin">👮Admin</Link>
                </li>
              )}
              {isAuthenticated && (
                <li>
                  <Link to="/dashboard">🔍Dashboard</Link>
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
                      Dashboard
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
    </header>
  )
}

export default Header
