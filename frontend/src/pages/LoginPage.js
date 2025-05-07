"use client"
import api from "../api"
import { useState, useContext, useEffect } from "react"
import { Link, useHistory, useLocation } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import FormInput from "../components/ui/FormInput"
import Button from "../components/ui/Button"
import Alert from "../components/ui/Alert"
import Card from "../components/ui/Card"
import { CardHeader, CardBody, CardFooter } from "../components/ui/Card"
import "./LoginPage.css"

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [formErrors, setFormErrors] = useState({})
  const [alertMessage, setAlertMessage] = useState("")
  const [alertType, setAlertType] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { login, isAuthenticated, error } = useContext(AuthContext)
  const history = useHistory()
  const location = useLocation()

  const { email, password } = formData

  useEffect(() => {
    // If already authenticated, redirect
    if (isAuthenticated) {
      const { from } = location.state || { from: { pathname: "/" } }
      history.push(from)
    }

    // Show error if any
    if (error) {
      setAlertMessage(error)
      setAlertType("error")
      setIsSubmitting(false)
    }
  }, [isAuthenticated, error, history, location])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    // Clear error for this field when user starts typing
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: "" })
    }
  }

  const validateForm = () => {
    const errors = {}
    // Email validation
    if (!email) {
      errors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Email is invalid"
    }
    
    // Password validation
    if (!password) {
      errors.password = "Password is required"
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters"
    }
    
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate form
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setIsSubmitting(true)

    try {
      await login(formData)
      // Redirect will happen in useEffect
    } catch (err) {
      setIsSubmitting(false)
      // Error will be handled in useEffect
    }
  }

  return (
    <div className="login-page">
      <div className="container">
        <Card className="login-card">
          <CardHeader>
            <h2>Login to Your Account</h2>
          </CardHeader>
          <CardBody>
            {alertMessage && <Alert message={alertMessage} type={alertType} onClose={() => setAlertMessage("")} />}
            <form onSubmit={handleSubmit} noValidate>
              <FormInput
                label="Email"
                type="email"
                id="email"
                name="email"
                value={email}
                placeholder="Enter your email"
                onChange={handleChange}
                error={formErrors.email}
                required
                pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                onBlur={(e) => {
                  if (!e.target.value) {
                    setFormErrors({...formErrors, email: "Email is required"})
                  } else if (!/\S+@\S+\.\S+/.test(e.target.value)) {
                    setFormErrors({...formErrors, email: "Email is invalid"})
                  }
                }}
              />
              <FormInput
                label="Password"
                type="password"
                id="password"
                name="password"
                value={password}
                placeholder="Enter your password"
                onChange={handleChange}
                error={formErrors.password}
                required
                minLength={6}
                onBlur={(e) => {
                  if (!e.target.value) {
                    setFormErrors({...formErrors, password: "Password is required"})
                  } else if (e.target.value.length < 6) {
                    setFormErrors({...formErrors, password: "Password must be at least 6 characters"})
                  }
                }}
              />
              <Button type="submit" fullWidth disabled={isSubmitting}>
                {isSubmitting ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardBody>
          <CardFooter>
            <p>
              Don't have an account?{" "}
              <Link to="/register" className="link">
                Register here
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default LoginPage
