"use client"

import { useContext } from "react"
import { ThemeContext } from "../../context/ThemeContext"
import "./ThemeToggle.css"

const ThemeToggle = () => {
  const { darkMode, toggleTheme } = useContext(ThemeContext)

  return (
    <div className="theme-toggle">
      <label className="switch">
        <input type="checkbox" checked={darkMode} onChange={toggleTheme} aria-label="Toggle dark mode" />
        <span className="slider round">
          <span className="icon">{darkMode ? "🌙" : "☀️"}</span>
        </span>
      </label>
    </div>
  )
}

export default ThemeToggle
