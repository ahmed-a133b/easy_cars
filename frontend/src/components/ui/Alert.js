"use client"

import { useState, useEffect, useRef } from "react"
import "./Alert.css"

const Alert = ({ message, type = "info", dismissible = true, duration = 0, onClose }) => {
  const [visible, setVisible] = useState(true)
  const timerRef = useRef(null)
  
  // Reset the visibility when message changes
  useEffect(() => {
    // If we get a new message, make sure the alert is visible
    setVisible(true)
    
    // Clear any existing timers
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    
    // Only set a timer if duration is positive
    if (duration > 0) {
      timerRef.current = setTimeout(() => {
        setVisible(false)
        if (onClose) onClose()
      }, duration)
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [message, duration, onClose])
  
  const handleClose = () => {
    setVisible(false)
    if (onClose) onClose()
  }

  if (!visible || !message) return null

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
