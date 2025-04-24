"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import Card from "../components/ui/Card"
import { CardBody, CardFooter } from "../components/ui/Card"
import Button from "../components/ui/Button"
import Spinner from "../components/ui/Spinner"
import "./DealershipsPage.css"

const DealershipsPage = () => {
  const [dealerships, setDealerships] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchDealerships = async () => {
      try {
        const res = await axios.get("/api/dealerships")
        setDealerships(res.data.data)
      } catch (err) {
        setError("Failed to fetch dealerships. Please try again later.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchDealerships()
  }, [])

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
        </div>
      </div>
    )
  }

  return (
    <div className="dealerships-page">
      <div className="container">
        <h1>Our Dealerships</h1>
        <p className="page-description">
          Visit one of our many dealership locations for personalized service and expert advice.
        </p>

        {dealerships.length === 0 ? (
          <div className="no-dealerships">
            <p>No dealerships found.</p>
          </div>
        ) : (
          <div className="dealerships-grid">
            {dealerships.map((dealership) => (
              <Card key={dealership._id} className="dealership-card">
                <div className="dealership-image">
                  <img src={dealership.images[0] || "/placeholder-dealership.jpg"} alt={dealership.name} />
                </div>
                <CardBody>
                  <h2>{dealership.name}</h2>
                  <div className="dealership-details">
                    <p className="dealership-address">
                      {dealership.address.street}, {dealership.address.city}, {dealership.address.state}{" "}
                      {dealership.address.zipCode}
                    </p>
                    <p className="dealership-contact">
                      <strong>Phone:</strong> {dealership.phone}
                    </p>
                    <p className="dealership-contact">
                      <strong>Email:</strong> {dealership.email}
                    </p>
                  </div>
                  {dealership.rating > 0 && (
                    <div className="dealership-rating">
                      <span className="rating-label">Rating:</span>
                      <span className="rating-stars">
                        {"★".repeat(Math.floor(dealership.rating))}
                        {"☆".repeat(5 - Math.floor(dealership.rating))}
                      </span>
                      <span className="rating-value">({dealership.rating.toFixed(1)})</span>
                    </div>
                  )}
                </CardBody>
                <CardFooter>
                  <Link to={`/dealerships/${dealership._id}`}>
                    <Button fullWidth>View Dealership</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DealershipsPage
