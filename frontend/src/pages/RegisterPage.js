"use client"

import { useState, useContext, useEffect } from "react"
import { Link, useHistory } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import FormInput from "../components/ui/FormInput"
import Button from "../components/ui/Button"
import Alert from "../components/ui/Alert"
import Card from "../components/ui/Card"
import { CardHeader, CardBody, CardFooter } from "../components/ui/Card"
import "./RegisterPage.css"

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
  })
  const [formErrors, setFormErrors] = useState({})
  const [alertMessage, setAlertMessage] = useState("")
  const [alertType, setAlertType] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, isAuthenticated, error } = useContext(AuthContext)
  const history = useHistory()

  const { name, email, password, confirmPassword, phone, address } = formData

  useEffect(() => {
    // If already authenticated, redirect
    if (isAuthenticated) {
      history.push("/")
    }

    // Show error if any
    if (error) {
      setAlertMessage(error)
      setAlertType("error")
      setIsSubmitting(false)
    }
  }, [isAuthenticated, error, history])

  const handleChange = (e) => {
    if (e.target.name.includes(".")) {
      // Handle nested address fields
      const [parent, child] = e.target.name.split(".")
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: e.target.value,
        },
      })
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    // Clear error for this field when user starts typing
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: "" })
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!name) errors.name = "Name is required"
    if (!email) errors.email = "Email is required"
    if (!password) errors.password = "Password is required"
    if (password.length < 6) errors.password = "Password must be at least 6 characters"
    if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match"
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

    // Remove confirmPassword before sending to API
    const { confirmPassword, ...registerData } = formData

    try {
      await register(registerData)
      // Redirect will happen in useEffect
    } catch (err) {
      setIsSubmitting(false)
      // Error will be handled in useEffect
    }
  }

  return (
    <div className="register-page">
      <div className="container">
        <Card className="register-card">
          <CardHeader>
            <h2>Create an Account</h2>
          </CardHeader>
          <CardBody>
            {alertMessage && <Alert message={alertMessage} type={alertType} onClose={() => setAlertMessage("")} />}
            <form onSubmit={handleSubmit}>
              <FormInput
                label="Name"
                type="text"
                id="name"
                name="name"
                value={name}
                placeholder="Enter your full name"
                onChange={handleChange}
                error={formErrors.name}
                required
              />
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
              />
              <FormInput
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                placeholder="Confirm your password"
                onChange={handleChange}
                error={formErrors.confirmPassword}
                required
              />
              <FormInput
                label="Phone"
                type="tel"
                id="phone"
                name="phone"
                value={phone}
                placeholder="Enter your phone number"
                onChange={handleChange}
              />

              <h3 className="address-heading">Address (Optional)</h3>
              <div className="address-fields">
                <FormInput
                  label="Street"
                  type="text"
                  id="street"
                  name="address.street"
                  value={address.street}
                  placeholder="Street address"
                  onChange={handleChange}
                />
                <FormInput
                  label="City"
                  type="text"
                  id="city"
                  name="address.city"
                  value={address.city}
                  placeholder="City"
                  onChange={handleChange}
                />
                <FormInput
                  label="State/Province"
                  type="text"
                  id="state"
                  name="address.state"
                  value={address.state}
                  placeholder="State or province"
                  onChange={handleChange}
                />
                <FormInput
                  label="Zip/Postal Code"
                  type="text"
                  id="zipCode"
                  name="address.zipCode"
                  value={address.zipCode}
                  placeholder="Zip or postal code"
                  onChange={handleChange}
                />
                <FormInput
                  label="Country"
                  type="text"
                  id="country"
                  name="address.country"
                  value={address.country}
                  placeholder="Country"
                  onChange={handleChange}
                />
              </div>

              <Button type="submit" fullWidth disabled={isSubmitting}>
                {isSubmitting ? "Creating Account..." : "Register"}
              </Button>
            </form>
          </CardBody>
          <CardFooter>
            <p>
              Already have an account?{" "}
              <Link to="/login" className="link">
                Login here
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default RegisterPage
