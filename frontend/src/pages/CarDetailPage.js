"use client"

import { useState, useEffect, useContext } from "react"
import { useParams, useHistory, Link } from "react-router-dom"
import axios from "axios"
import { AuthContext } from "../context/AuthContext"
import Card from "../components/ui/Card"
import { CardHeader, CardBody, CardFooter } from "../components/ui/Card"
import Button from "../components/ui/Button"
import Spinner from "../components/ui/Spinner"
import "./CarDetailPage.css"

const CarDetailPage = () => {
  const { id } = useParams()
  const history = useHistory()
  const { isAuthenticated } = useContext(AuthContext)

  const [car, setCar] = useState(null)
  const [dealership, setDealership] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        const res = await axios.get(`/api/cars/${id}`)
        setCar(res.data.data)
        setDealership(res.data.data.dealership)
      } catch (err) {
        setError("Failed to fetch car details. Please try again later.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchCarDetails()
  }, [id])

  const handleRentClick = () => {
    if (isAuthenticated) {
      history.push(`/rent/${id}`)
    } else {
      history.push("/login", { from: `/rent/${id}` })
    }
  }

  const handleBuyClick = () => {
    if (isAuthenticated) {
      history.push(`/sell?carId=${id}`)
    } else {
      history.push("/login", { from: `/sell?carId=${id}` })
    }
  }

  if (loading) {
    return (
      <div className="spinner-container">
        <Spinner />
      </div>
    )
  }

  if (error) {
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

  if (!car) {
    return (
      <div className="container">
        <div className="error-message">
          <p>Car not found.</p>
          <Link to="/cars">
            <Button>Back to Car Listings</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="car-detail-page">
      <div className="container">
        <div className="car-detail-content">
          <div className="car-gallery">
            <div className="main-image">
              <img src={car.images[activeImage] || "/placeholder-car.jpg"} alt={`${car.make} ${car.model}`} />
            </div>
            {car.images.length > 1 && (
              <div className="thumbnail-images">
                {car.images.map((image, index) => (
                  <div
                    key={index}
                    className={`thumbnail ${activeImage === index ? "active" : ""}`}
                    onClick={() => setActiveImage(index)}
                  >
                    <img src={image || "/placeholder.svg"} alt={`${car.make} ${car.model} thumbnail ${index + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="car-info">
            <Card>
              <CardHeader>
                <h1>{`${car.make} ${car.model} (${car.year})`}</h1>
                <div className="car-badges">
                  {car.forRent && car.available && <span className="car-badge rent-badge">For Rent</span>}
                  {car.forSale && car.available && <span className="car-badge sale-badge">For Sale</span>}
                  {!car.available && <span className="car-badge unavailable-badge">Unavailable</span>}
                </div>
              </CardHeader>
              <CardBody>
                <div className="car-specs">
                  <div className="spec-item">
                    <span className="spec-label">Color</span>
                    <span className="spec-value">{car.color}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Mileage</span>
                    <span className="spec-value">{car.mileage.toLocaleString()} miles</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Transmission</span>
                    <span className="spec-value">{car.transmission}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Fuel Type</span>
                    <span className="spec-value">{car.fuelType}</span>
                  </div>
                </div>

                <div className="car-pricing">
                  {car.forSale && car.available && (
                    <div className="price-item">
                      <span className="price-label">Sale Price</span>
                      <span className="price-value">${car.price.toLocaleString()}</span>
                    </div>
                  )}
                  {car.forRent && car.available && car.rentalPrice && (
                    <div className="rental-prices">
                      <div className="price-item">
                        <span className="price-label">Daily Rate</span>
                        <span className="price-value">${car.rentalPrice.daily}/day</span>
                      </div>
                      {car.rentalPrice.weekly && (
                        <div className="price-item">
                          <span className="price-label">Weekly Rate</span>
                          <span className="price-value">${car.rentalPrice.weekly}/week</span>
                        </div>
                      )}
                      {car.rentalPrice.monthly && (
                        <div className="price-item">
                          <span className="price-label">Monthly Rate</span>
                          <span className="price-value">${car.rentalPrice.monthly}/month</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="car-description">
                  <h3>Description</h3>
                  <p>{car.description}</p>
                </div>

                {car.features && car.features.length > 0 && (
                  <div className="car-features">
                    <h3>Features</h3>
                    <ul className="features-list">
                      {car.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardBody>
              <CardFooter>
                <div className="car-actions">
                  {car.forRent && car.available && <Button onClick={handleRentClick}>Rent This Car</Button>}
                  {car.forSale && car.available && <Button onClick={handleBuyClick}>Buy This Car</Button>}
                  <Link to="/cars">
                    <Button variant="secondary">Back to Listings</Button>
                  </Link>
                </div>
              </CardFooter>
            </Card>

            {dealership && (
              <Card className="dealership-card">
                <CardHeader>
                  <h3>Available at</h3>
                </CardHeader>
                <CardBody>
                  <h4>{dealership.name}</h4>
                  <p>
                    {dealership.address.street}, {dealership.address.city}, {dealership.address.state}{" "}
                    {dealership.address.zipCode}
                  </p>
                  <p>Phone: {dealership.phone}</p>
                  <p>Email: {dealership.email}</p>
                  <Link to={`/dealerships/${dealership._id}`}>
                    <Button variant="outline" size="small">
                      View Dealership
                    </Button>
                  </Link>
                </CardBody>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CarDetailPage
