"use client"
import api from "../api"
import { useState, useEffect, useContext } from "react"
import { useParams, useHistory, Link } from "react-router-dom"
import axios from "axios"
import { AuthContext } from "../context/AuthContext"
import Card from "../components/ui/Card"
import { CardHeader, CardBody, CardFooter } from "../components/ui/Card"
import Button from "../components/ui/Button"
import FormInput from "../components/ui/FormInput"
import Alert from "../components/ui/Alert"
import Spinner from "../components/ui/Spinner"
import "./RentCarPage.css"

const RentCarPage = () => {
  const { id } = useParams()
  const history = useHistory()
  const { user } = useContext(AuthContext)

  const [car, setCar] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    paymentMethod: "credit_card",
  })
  const [formErrors, setFormErrors] = useState({})

  const [rentalSummary, setRentalSummary] = useState({
    days: 0,
    dailyRate: 0,
    totalPrice: 0,
  })

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        const res = await api.get(`/cars/${id}`)
        const carData = res.data.data

        if (!carData.forRent || !carData.available) {
          setError("This car is not available for rent.")
          setLoading(false)
          return
        }

        setCar(carData)

        // Set default dates (today and tomorrow)
        const today = new Date()
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        const formattedToday = today.toISOString().split("T")[0]
        const formattedTomorrow = tomorrow.toISOString().split("T")[0]

        setFormData({
          ...formData,
          startDate: formattedToday,
          endDate: formattedTomorrow,
        })

        // Calculate initial rental summary
        if (carData.rentalPrice && carData.rentalPrice.daily) {
          setRentalSummary({
            days: 1,
            dailyRate: carData.rentalPrice.daily,
            totalPrice: carData.rentalPrice.daily,
          })
        }
      } catch (err) {
        setError("Failed to fetch car details. Please try again later.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchCarDetails()
  }, [id])

  useEffect(() => {
    // Calculate rental summary whenever dates change
    if (car && car.rentalPrice && formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      const diffTime = Math.abs(end - start)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays <= 0) {
        return
      }

      const dailyRate = car.rentalPrice.daily
      const totalPrice = dailyRate * diffDays

      setRentalSummary({
        days: diffDays,
        dailyRate,
        totalPrice,
      })
    }
  }, [car, formData.startDate, formData.endDate])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    
    // Clear error for this field when user starts typing
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: "" })
    }
  }

  const validateForm = () => {
    const errors = {}
    // Validate start date
    if (!formData.startDate) {
      errors.startDate = "Start date is required"
    } else {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const startDate = new Date(formData.startDate)
      if (startDate < today) {
        errors.startDate = "Start date cannot be in the past"
      }
    }
    
    // Validate end date
    if (!formData.endDate) {
      errors.endDate = "End date is required"
    } else if (formData.startDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      if (end <= start) {
        errors.endDate = "End date must be after start date"
      }
    }
    
    // Validate payment method
    if (!formData.paymentMethod) {
      errors.paymentMethod = "Payment method is required"
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

    // Start and end date already validated in validateForm()
    
    setSubmitting(true)
    setError("")

    try {
      const rentalData = {
        carId: id,
        startDate: formData.startDate,
        endDate: formData.endDate,
        paymentMethod: formData.paymentMethod,
      }

      await api.post("/rentals", rentalData)

      setSuccess("Your rental has been successfully booked!")

      // Redirect to profile page after 2 seconds
      setTimeout(() => {
        history.push("/profile")
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to book rental. Please try again.")
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="spinner-container">
        <Spinner />
      </div>
    )
  }

  if (error && !car) {
    return (
      <div className="container">
        <div className="error-message">
          <p>{error}</p>
          <Link to="/cars">
            <Button>Back to Car Listings</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="rent-car-page">
      <div className="container">
        <h1>Rent a Car</h1>

        <div className="rent-car-content">
          {car && (
            <div className="car-summary">
              <Card>
                <CardHeader>
                  <h2>{`${car.make} ${car.model} (${car.year})`}</h2>
                </CardHeader>
                <CardBody>
                  <div className="car-image">
                    <img src={car.images[0] || "/placeholder-car.jpg"} alt={`${car.make} ${car.model}`} />
                  </div>
                  <div className="car-details">
                    <p>
                      <strong>Color:</strong> {car.color}
                    </p>
                    <p>
                      <strong>Transmission:</strong> {car.transmission}
                    </p>
                    <p>
                      <strong>Fuel Type:</strong> {car.fuelType}
                    </p>
                    <p>
                      <strong>Daily Rate:</strong> ${car.rentalPrice.daily}
                    </p>
                  </div>
                </CardBody>
              </Card>
            </div>
          )}

          <div className="rental-form">
            <Card>
              <CardHeader>
                <h2>Rental Details</h2>
              </CardHeader>
              <CardBody>
                {success ? (
                  <Alert message={success} type="success" />
                ) : (
                  <>
                    {error && <Alert message={error} type="error" onClose={() => setError("")} />}
                    <form onSubmit={handleSubmit} noValidate>
                      <div className="form-row">
                        <FormInput
                          label="Start Date"
                          type="date"
                          id="startDate"
                          name="startDate"
                          value={formData.startDate}
                          onChange={handleChange}
                          min={new Date().toISOString().split("T")[0]}
                          required
                          error={formErrors.startDate}
                          onBlur={() => {
                            if (!formData.startDate) {
                              setFormErrors({...formErrors, startDate: "Start date is required"})
                            } else {
                              const today = new Date()
                              today.setHours(0, 0, 0, 0)
                              const startDate = new Date(formData.startDate)
                              if (startDate < today) {
                                setFormErrors({...formErrors, startDate: "Start date cannot be in the past"})
                              }
                            }
                          }}
                        />
                        <FormInput
                          label="End Date"
                          type="date"
                          id="endDate"
                          name="endDate"
                          value={formData.endDate}
                          onChange={handleChange}
                          min={formData.startDate || new Date().toISOString().split("T")[0]}
                          required
                          error={formErrors.endDate}
                          onBlur={() => {
                            if (!formData.endDate) {
                              setFormErrors({...formErrors, endDate: "End date is required"})
                            } else if (formData.startDate) {
                              const start = new Date(formData.startDate)
                              const end = new Date(formData.endDate)
                              if (end <= start) {
                                setFormErrors({...formErrors, endDate: "End date must be after start date"})
                              }
                            }
                          }}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="paymentMethod">Payment Method</label>
                        <select
                          id="paymentMethod"
                          name="paymentMethod"
                          value={formData.paymentMethod}
                          onChange={handleChange}
                          className={`form-select ${formErrors.paymentMethod ? "form-select-error" : ""}`}
                          required
                        >
                          <option value="credit_card">Credit Card</option>
                          <option value="debit_card">Debit Card</option>
                          <option value="paypal">PayPal</option>
                        </select>
                        {formErrors.paymentMethod && <div className="form-error">{formErrors.paymentMethod}</div>}
                      </div>

                      <div className="rental-summary">
                        <h3>Rental Summary</h3>
                        <div className="summary-item">
                          <span>Daily Rate:</span>
                          <span>${rentalSummary.dailyRate}</span>
                        </div>
                        <div className="summary-item">
                          <span>Number of Days:</span>
                          <span>{rentalSummary.days}</span>
                        </div>
                        <div className="summary-item total">
                          <span>Total Price:</span>
                          <span>${rentalSummary.totalPrice}</span>
                        </div>
                      </div>

                      <div className="renter-info">
                        <h3>Renter Information</h3>
                        <div className="info-item">
                          <span>Name:</span>
                          <span>{user.name}</span>
                        </div>
                        <div className="info-item">
                          <span>Email:</span>
                          <span>{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="info-item">
                            <span>Phone:</span>
                            <span>{user.phone}</span>
                          </div>
                        )}
                      </div>

                      <Button type="submit" fullWidth disabled={submitting}>
                        {submitting ? "Processing..." : "Confirm Rental"}
                      </Button>
                    </form>
                  </>
                )}
              </CardBody>
              <CardFooter>
                <Link to={`/cars/${id}`}>
                  <Button variant="secondary">Back to Car Details</Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RentCarPage
