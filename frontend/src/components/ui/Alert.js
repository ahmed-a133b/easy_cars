"use client"

import { useState, useEffect } from "react"
import "./Alert.css"

const Alert = ({ message, type = "info", dismissible = true, duration = 0, onClose }) => {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false)
        if (onClose) onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const handleClose = () => {
    setVisible(false)
    if (onClose) onClose()
  }

  if (!visible) return null

  return (
    <div className={`alert alert-${type}`} role="alert">
      <div className="alert-content">{message}</div>
      {dismissible && (
        <button 
          className="alert-close" 
          onClick={handleClose}
          aria-label="Close alert"
        >
          &times;
        </button>
      )}
    </div>
  )
}

export default Alert
