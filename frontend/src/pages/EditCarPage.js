"use client"
import { useState, useEffect, useContext } from "react"
import { useParams, useHistory } from "react-router-dom"
import api from "../api"
import { AuthContext } from "../context/AuthContext"
import Card from "../components/ui/Card"
import { CardBody } from "../components/ui/Card"
import Button from "../components/ui/Button"
import FormInput from "../components/ui/FormInput"
import Alert from "../components/ui/Alert"
import Spinner from "../components/ui/Spinner"
import "./UserDashboard.css" // We'll reuse the UserDashboard styles

const EditCarPage = () => {
  const { id } = useParams()
  const history = useHistory()
  const { isAuthenticated } = useContext(AuthContext)
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  
  // Car form state
  const [carForm, setCarForm] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    color: "",
    price: "",
    mileage: "",
    fuelType: "Gasoline",
    transmission: "Automatic",
    description: "",
    features: "",
    forSale: true,
    forRent: false,
    available: true,
    rentalPrice: {
      daily: "",
      weekly: "",
      monthly: ""
    },
    images: []
  })

  useEffect(() => {
    if (!isAuthenticated) {
      history.push("/login")
      return
    }

    const fetchCarDetails = async () => {
      setLoading(true)
      try {
        const response = await api.get(`/cars/${id}`)
        const car = response.data.data
        
        // Format features array back to a string
        const featuresString = car.features ? car.features.join(", ") : ""
        
        setCarForm({
          ...car,
          features: featuresString
        })
      } catch (err) {
        setError("Failed to fetch car details. Please try again later.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchCarDetails()
  }, [id, isAuthenticated, history])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name.startsWith("rental")) {
      // Handle rental price fields
      const rentalField = name.split(".")[1] // Get daily, weekly, or monthly
      setCarForm(prev => ({
        ...prev,
        rentalPrice: {
          ...prev.rentalPrice,
          [rentalField]: value
        }
      }))
    } else if (type === "checkbox") {
      setCarForm(prev => ({
        ...prev,
        [name]: checked
      }))
    } else {
      setCarForm(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!isAuthenticated) {
      history.push("/login")
      return
    }

    // Validate form
    if (!carForm.make || !carForm.model || !carForm.price) {
      setError("Please fill out all required fields")
      return
    }

    if (carForm.forRent && !carForm.rentalPrice.daily) {
      setError("Daily rental price is required when listing for rent")
      return
    }

    setSubmitting(true)
    setError("")
    setSuccess("")

    try {
      // Convert features string to array
      const featuresArray = carForm.features
        ? carForm.features.split(',').map(feature => feature.trim())
        : []

      // Prepare the data
      const carData = {
        ...carForm,
        features: featuresArray,
        // Only include rental price if forRent is true
        rentalPrice: carForm.forRent ? carForm.rentalPrice : undefined
      }

      // Make API call to update car
      await api.put(`/cars/${id}`, carData)
      
      setSuccess("Car updated successfully!")
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        history.push("/dashboard")
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update car listing. Please try again.")
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (!isAuthenticated) {
    return null // Redirecting to login in useEffect
  }

  return (
    <div className="user-dashboard-page">
      <div className="container">
        <h1>Edit Car Listing</h1>
        
        {error && (
          <Alert message={error} type="error" onClose={() => setError("")} />
        )}
        
        {success && (
          <Alert message={success} type="success" onClose={() => setSuccess("")} />
        )}

        <div className="dashboard-content">
          {loading ? (
            <div className="spinner-container">
              <Spinner />
            </div>
          ) : (
            <Card>
              <CardBody>
                <form onSubmit={handleSubmit} className="listing-form">
                  <div className="form-row">
                    <FormInput
                      label="Make *"
                      type="text"
                      id="make"
                      name="make"
                      value={carForm.make}
                      onChange={handleInputChange}
                      placeholder="e.g. Toyota, Honda"
                      required
                    />
                    <FormInput
                      label="Model *"
                      type="text"
                      id="model"
                      name="model"
                      value={carForm.model}
                      onChange={handleInputChange}
                      placeholder="e.g. Camry, Civic"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <FormInput
                      label="Year *"
                      type="number"
                      id="year"
                      name="year"
                      value={carForm.year}
                      onChange={handleInputChange}
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      required
                    />
                    <FormInput
                      label="Color *"
                      type="text"
                      id="color"
                      name="color"
                      value={carForm.color}
                      onChange={handleInputChange}
                      placeholder="e.g. Red, Blue, Silver"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <FormInput
                      label="Price ($) *"
                      type="number"
                      id="price"
                      name="price"
                      value={carForm.price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      placeholder="Sale price"
                      required
                    />
                    <FormInput
                      label="Mileage *"
                      type="number"
                      id="mileage"
                      name="mileage"
                      value={carForm.mileage}
                      onChange={handleInputChange}
                      min="0"
                      placeholder="Mileage in miles"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="fuelType">Fuel Type *</label>
                      <select
                        id="fuelType"
                        name="fuelType"
                        value={carForm.fuelType}
                        onChange={handleInputChange}
                        className="form-select"
                        required
                      >
                        <option value="Gasoline">Gasoline</option>
                        <option value="Diesel">Diesel</option>
                        <option value="Electric">Electric</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="transmission">Transmission *</label>
                      <select
                        id="transmission"
                        name="transmission"
                        value={carForm.transmission}
                        onChange={handleInputChange}
                        className="form-select"
                        required
                      >
                        <option value="Automatic">Automatic</option>
                        <option value="Manual">Manual</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="description">Description *</label>
                    <textarea
                      id="description"
                      name="description"
                      value={carForm.description}
                      onChange={handleInputChange}
                      className="form-textarea"
                      rows="4"
                      placeholder="Provide details about the car's condition, history, etc."
                      required
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label htmlFor="features">Features (comma separated)</label>
                    <textarea
                      id="features"
                      name="features"
                      value={carForm.features}
                      onChange={handleInputChange}
                      className="form-textarea"
                      rows="2"
                      placeholder="e.g. Leather Seats, Navigation System, Heated Seats"
                    ></textarea>
                  </div>

                  <div className="form-row listing-options">
                    <div className="form-group checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="forSale"
                          checked={carForm.forSale}
                          onChange={handleInputChange}
                        />
                        List for Sale
                      </label>
                    </div>
                    <div className="form-group checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="forRent"
                          checked={carForm.forRent}
                          onChange={handleInputChange}
                        />
                        List for Rent
                      </label>
                    </div>
                    <div className="form-group checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="available"
                          checked={carForm.available}
                          onChange={handleInputChange}
                        />
                        Available
                      </label>
                    </div>
                  </div>

                  {carForm.forRent && (
                    <div className="rental-prices">
                      <h3>Rental Pricing</h3>
                      <div className="form-row">
                        <FormInput
                          label="Daily Rate ($) *"
                          type="number"
                          id="rental-daily"
                          name="rental.daily"
                          value={carForm.rentalPrice.daily}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          placeholder="Daily rental price"
                          required
                        />
                        <FormInput
                          label="Weekly Rate ($)"
                          type="number"
                          id="rental-weekly"
                          name="rental.weekly"
                          value={carForm.rentalPrice.weekly}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          placeholder="Weekly rental price"
                        />
                        <FormInput
                          label="Monthly Rate ($)"
                          type="number"
                          id="rental-monthly"
                          name="rental.monthly"
                          value={carForm.rentalPrice.monthly}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          placeholder="Monthly rental price"
                        />
                      </div>
                    </div>
                  )}

                  <div className="form-actions">
                    <Button 
                      type="submit" 
                      disabled={submitting}
                      className="submit-button"
                    >
                      {submitting ? 'Updating...' : 'Update Listing'}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => history.push('/dashboard')}
                      className="cancel-button"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default EditCarPage 