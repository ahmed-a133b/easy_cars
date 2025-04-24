"use client"
import "./Card.css"

const Card = ({ children, className = "", onClick }) => {
  return (
    <div className={`card ${className}`} onClick={onClick}>
      {children}
    </div>
  )
}

export const CardHeader = ({ children, className = "" }) => {
  return <div className={`card-header ${className}`}>{children}</div>
}

export const CardBody = ({ children, className = "" }) => {
  return <div className={`card-body ${className}`}>{children}</div>
}

export const CardFooter = ({ children, className = "" }) => {
  return <div className={`card-footer ${className}`}>{children}</div>
}

export default Card
