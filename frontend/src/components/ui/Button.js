"use client"
import "./Button.css"

const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "medium",
  fullWidth = false,
  disabled = false,
  onClick,
  className = "",
}) => {
  const buttonClasses = `
    button 
    button-${variant} 
    button-${size} 
    ${fullWidth ? "button-full-width" : ""} 
    ${disabled ? "button-disabled" : ""} 
    ${className}
  `

  return (
    <button type={type} className={buttonClasses} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  )
}

export default Button
