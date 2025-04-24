"use client"

import { useContext } from "react"
import { Link } from "react-router-dom"
import { ThemeContext } from "../../context/ThemeContext"
import "./Footer.css"

const Footer = () => {
  const { darkMode } = useContext(ThemeContext)
  const currentYear = new Date().getFullYear()

  return (
    <footer className={`footer ${darkMode ? "dark" : "light"}`}>
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Easy Cars</h3>
            <p>Your one-stop platform for all your automotive needs.</p>
          </div>
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul className="footer-links">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/cars">Cars</Link>
              </li>
              <li>
                <Link to="/dealerships">Dealerships</Link>
              </li>
              <li>
                <Link to="/forum">Forum</Link>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Contact Us</h3>
            <p>Email: info@easycars.com</p>
            <p>Phone: (123) 456-7890</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {currentYear} Easy Cars.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
