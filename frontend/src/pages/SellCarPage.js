"use client"

import { useState, useEffect, useContext } from "react"
import { useLocation, useHistory, Link } from "react-router-dom"
import axios from "axios"
import { AuthContext } from "../context/AuthContext"
import Card from "../components/ui/Card"
import { CardHeader, CardBody, CardFooter } from "../components/ui/Card"
import Button from "../components/ui/Button"
import Alert from "../components/ui/Alert"
import Spinner from "../components/ui/Spinner"
import "./SellCarPage.css"

const SellCarPage = () => {
  const location = useLocation()
  const history = useHistory()
  const { user } = useContext(AuthContext)

  const queryParams = new URLSearchParams(location.search)
  const carId = queryParams.get("carId")

  const [car, setCar] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState({
    paymentMethod: "credit_card",
  })

  useEffect(() => {
    if (!carId) {
      setError("No car selected for purchase.")
      setLoading(false)
      return
    }

    const fetchCarDetails = async () => {
      try {
        const res = await axios.get(`/api/cars/${carId}`)
        const carData = res.data.data

        if (!carData.forSale || !carData.available) {
          setError("This car is not available for sale.")
          setLoading(false)
          return
        }

        setCar(carData)
      } catch (err) {
        setError("Failed to fetch car details. Please try again later.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchCarDetails()
  }, [carId])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setSubmitting(true)
    setError("")

    try {
      const saleData = {
        carId,
        paymentMethod: formData.paymentMethod,
      }

      await axios.post("/api/sales", saleData)

      setSuccess("Your purchase has been successfully completed!")

      // Redirect to profile page after 2 seconds
      setTimeout(() => {
        history.push("/profile")
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to complete purchase. Please try again.")
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
    <div className="sell-car-page">
      <div className="container">
        <h1>Purchase Car</h1>

        <div className="sell-car-content">
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
                      <strong>Mileage:</strong> {car.mileage.toLocaleString()} miles
                    </p>
                    <p>
                      <strong>Transmission:</strong> {car.transmission}
                    </p>
                    <p>
                      <strong>Fuel Type:</strong> {car.fuelType}
                    </p>
                    <p className="car-price">
                      <strong>Price:</strong> ${car.price.toLocaleString()}
                    </p>
                  </div>
                </CardBody>
              </Card>
            </div>
          )}

          <div className="purchase-form">
            <Card>
              <CardHeader>
                <h2>Purchase Details</h2>
              </CardHeader>
              <CardBody>
                {success ? (
                  <Alert message={success} type="success" />
                ) : (
                  <>
                    {error && <Alert message={error} type="error" onClose={() => setError("")} />}
                    <form onSubmit={handleSubmit}>
                      <div className="form-group">
                        <label htmlFor="paymentMethod">Payment Method</label>
                        <select
                          id="paymentMethod"
                          name="paymentMethod"
                          value={formData.paymentMethod}
                          onChange={handleChange}
                          className="form-select"
                        >
                          <option value="credit_card">Credit Card</option>
                          <option value="debit_card">Debit Card</option>
                          <option value="paypal">PayPal</option>
                          <option value="financing">Financing</option>
                          <option value="cash">Cash</option>
                        </select>
                      </div>

                      <div className="purchase-summary">
                        <h3>Purchase Summary</h3>
                        <div className="summary-item">
                          <span>Car Price:</span>
                          <span>${car?.price.toLocaleString()}</span>
                        </div>
                        <div className="summary-item">
                          <span>Tax (8%):</span>
                          <span>${(car?.price * 0.08).toLocaleString()}</span>
                        </div>
                        <div className="summary-item">
                          <span>Processing Fee:</span>
                          <span>$299</span>
                        </div>
                        <div className="summary-item total">
                          <span>Total Price:</span>
                          <span>${(car?.price * 1.08 + 299).toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="buyer-info">
                        <h3>Buyer Information</h3>
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
                        {submitting ? "Processing..." : "Complete Purchase"}
                      </Button>
                    </form>
                  </>
                )}
              </CardBody>
              <CardFooter>
                <Link to={`/cars/${carId}`}>
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

export default SellCarPage
