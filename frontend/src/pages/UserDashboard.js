"use client"
import { useState, useEffect, useContext, useRef } from "react"
import { Link, useHistory } from "react-router-dom"
import api from "../api"
import { AuthContext } from "../context/AuthContext"
import Card from "../components/ui/Card"
import { CardHeader, CardBody, CardFooter } from "../components/ui/Card"
import Button from "../components/ui/Button"
import FormInput from "../components/ui/FormInput"
import Alert from "../components/ui/Alert"
import Spinner from "../components/ui/Spinner"
import "./UserDashboard.css"

const UserDashboard = () => {
  const { user, isAuthenticated } = useContext(AuthContext)
  const history = useHistory()
  const fileInputRef = useRef(null)

  const [activeTab, setActiveTab] = useState("my-listings")
  const [myListings, setMyListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [previewImages, setPreviewImages] = useState([])
  const [uploadedImageUrls, setUploadedImageUrls] = useState([])

  // New car form state
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
    rentalPrice: {
      daily: "",
      weekly: "",
      monthly: ""
    }
  })

  useEffect(() => {
    if (!isAuthenticated) {
      history.push("/login")
      return
    }

    const fetchMyListings = async () => {
      setLoading(true)
      try {
        // Assuming the API endpoint exists or will be created
        const response = await api.get("/cars/my-listings")
        setMyListings(response.data.data)
      } catch (err) {
        setError("Failed to fetch your car listings. Please try again later.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchMyListings()
  }, [isAuthenticated, history])

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

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    // Preview images locally first
    const newPreviewImages = files.map(file => URL.createObjectURL(file))
    setPreviewImages(prev => [...prev, ...newPreviewImages])

    // Upload to server
    setUploadingImages(true)
    setError("")

    try {
      const formData = new FormData()
      files.forEach(file => {
        formData.append('images', file)
      })

      // Upload images to Cloudinary via our API
      const response = await api.post("/upload", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      setUploadedImageUrls(prev => [...prev, ...response.data.urls])
    } catch (err) {
      setError("Failed to upload images. Please try again.")
      console.error(err)
    } finally {
      setUploadingImages(false)
    }
  }

  const removeImage = (index) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index))
    setUploadedImageUrls(prev => prev.filter((_, i) => i !== index))
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

    setFormSubmitting(true)
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
        images: uploadedImageUrls,
        // Only include rental price if forRent is true
        rentalPrice: carForm.forRent ? carForm.rentalPrice : undefined
      }

      // Make API call to create car
      const response = await api.post("/cars", carData)
      
      setSuccess("Car listed successfully!")
      setMyListings(prev => [response.data.data, ...prev])
      
      // Reset form
      setCarForm({
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
        rentalPrice: {
          daily: "",
          weekly: "",
          monthly: ""
        }
      })
      setPreviewImages([])
      setUploadedImageUrls([])
      
      // Switch to My Listings tab
      setActiveTab("my-listings")
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create car listing. Please try again.")
      console.error(err)
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleDeleteListing = async (carId) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) {
      return
    }

    try {
      await api.delete(`/cars/${carId}`)
      setSuccess("Car listing deleted successfully")
      setMyListings(prev => prev.filter(car => car._id !== carId))
    } catch (err) {
      setError("Failed to delete car listing. Please try again.")
      console.error(err)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  if (!isAuthenticated) {
    return null // Redirecting to login in useEffect
  }

  return (
    <div className="user-dashboard-page">
      <div className="container">
        <h1>My Dashboard</h1>
        
        <div className="dashboard-tabs">
          <button
            className={`tab-button ${activeTab === 'my-listings' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-listings')}
          >
            My Car Listings
          </button>
          <button
            className={`tab-button ${activeTab === 'new-listing' ? 'active' : ''}`}
            onClick={() => setActiveTab('new-listing')}
          >
            Create New Listing
          </button>
        </div>

        {error && (
          <Alert message={error} type="error" onClose={() => setError("")} />
        )}
        
        {success && (
          <Alert message={success} type="success" onClose={() => setSuccess("")} />
        )}

        <div className="dashboard-content">
          {activeTab === 'my-listings' && (
            <div className="my-listings-tab">
              <div className="tab-header">
                <h2>My Car Listings</h2>
                <Button 
                  onClick={() => setActiveTab('new-listing')}
                  className="create-listing-btn"
                  size="small"
                  variant="primary"
                >
                  + Create Listing
                </Button>
              </div>

              {loading ? (
                <div className="spinner-container">
                  <Spinner />
                </div>
              ) : myListings.length === 0 ? (
                <div className="no-listings">
                  <p>You don't have any car listings yet.</p>
                  <Button 
                    onClick={() => setActiveTab('new-listing')}
                    size="large"
                    className="first-listing-btn"
                  >
                    Create Your First Listing
                  </Button>
                </div>
              ) : (
                <div className="car-listings-grid">
                  {myListings.map((car) => (
                    <Card key={car._id} className="car-listing-card">
                      <div className="car-img-container">
                        <img 
                          src={car.images[0] || "/placeholder-car.jpg"} 
                          alt={`${car.make} ${car.model}`} 
                          className="car-image" 
                        />
                        <div className="car-badges">
                          {car.forSale && <span className="car-badge sale-badge">For Sale</span>}
                          {car.forRent && <span className="car-badge rent-badge">For Rent</span>}
                          {!car.available && <span className="car-badge unavailable-badge">Unavailable</span>}
                          <span className="car-badge owner-badge">Your Listing</span>
                        </div>
                      </div>
                      <CardBody>
                        <h3 className="car-title">{car.make} {car.model} ({car.year})</h3>
                        <div className="car-info">
                          <p><strong>Price:</strong> {formatPrice(car.price)}</p>
                          <p><strong>Color:</strong> {car.color}</p>
                          <p><strong>Mileage:</strong> {car.mileage.toLocaleString()} miles</p>
                        </div>
                      </CardBody>
                      <CardFooter className="card-actions-footer">
                        <div className="listing-actions">
                          <Link to={`/cars/${car._id}`} className="action-link">
                            <Button variant="primary" size="medium" className="action-button view-button">
                              <span className="button-icon">👁️</span> View
                            </Button>
                          </Link>
                          <Link to={`/edit-car/${car._id}`} className="action-link">
                            <Button variant="outline" size="medium" className="action-button edit-button">
                              <span className="button-icon">✏️</span> Edit
                            </Button>
                          </Link>
                          <Button 
                            variant="danger" 
                            size="medium" 
                            onClick={() => handleDeleteListing(car._id)}
                            className="action-button delete-button"
                          >
                            <span className="button-icon">🗑️</span> Delete
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'new-listing' && (
            <div className="new-listing-tab">
              <h2>Create New Car Listing</h2>
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

                    <div className="form-group image-upload-section">
                      <label>Car Images</label>
                      <div className="upload-container">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                          multiple
                          accept="image/*"
                          style={{ display: 'none' }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current.click()}
                          disabled={uploadingImages}
                        >
                          {uploadingImages ? 'Uploading...' : 'Select Images'}
                        </Button>
                        <span className="upload-help-text">
                          Upload clear images of the exterior and interior of your car.
                        </span>
                      </div>

                      {previewImages.length > 0 && (
                        <div className="image-previews">
                          {previewImages.map((img, index) => (
                            <div key={index} className="image-preview-container">
                              <img src={img} alt={`Preview ${index + 1}`} className="image-preview" />
                              <button
                                type="button"
                                className="remove-image-btn"
                                onClick={() => removeImage(index)}
                                title="Remove image"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="form-actions">
                      <Button type="submit" disabled={formSubmitting || uploadingImages}>
                        {formSubmitting ? 'Creating Listing...' : 'Create Listing'}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setActiveTab('my-listings')}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardBody>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserDashboard 