"use client"
import api from "../api"
import { useState, useEffect, useContext } from "react"
import { Link, useLocation } from "react-router-dom"
import axios from "axios"
import Card from "../components/ui/Card"
import { CardBody } from "../components/ui/Card"
import Button from "../components/ui/Button"
import FormInput from "../components/ui/FormInput"
import Spinner from "../components/ui/Spinner"
import { AuthContext } from "../context/AuthContext"
import "./CarListingsPage.css"

const CarListingsPage = () => {
  const { user, isAuthenticated } = useContext(AuthContext)
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filters, setFilters] = useState({
    make: "",
    model: "",
    minPrice: "",
    maxPrice: "",
    forRent: false,
    forSale: false,
  })

  const location = useLocation()

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search)
    const forRent = queryParams.get("forRent") === "true"
    const forSale = queryParams.get("forSale") === "true"
  
    setFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters, forRent, forSale }
  
      const fetchCars = async () => {
        setLoading(true)
        try {
          const params = { ...updatedFilters, available: true }
          Object.keys(params).forEach(
            (key) => (params[key] === "" || params[key] === false) && delete params[key]
          )
          const res = await api.get("/cars", { params })
          setCars(res.data.data)
        } catch (err) {
          setError("Failed to fetch cars. Please try again later.")
          console.error(err)
        } finally {
          setLoading(false)
        }
      }
  
      fetchCars()
      return updatedFilters
    })
  }, [location.search])
  
  // Check if current user is the owner of the car
  const isOwner = (car) => {
    if (!isAuthenticated || !user || !car || !car.owner) {
      console.log("Missing data for owner check:", { isAuthenticated, userId: user?.id, carOwnerId: car?.owner });
      return false;
    }
    
    // Handle both populated owner object and owner ID string
    const ownerId = typeof car.owner === 'object' ? car.owner._id : car.owner;
    console.log("Comparing user ID and car owner:", { userId: user.id, carOwnerId: ownerId });
    return ownerId.toString() === user.id.toString();
  }

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target
    setFilters({
      ...filters,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const fetchFilteredCars = async (params) => {
    setLoading(true)
    try {
      const filtered = { ...params, available: true }
      Object.keys(filtered).forEach(
        (key) => (filtered[key] === "" || filtered[key] === false) && delete filtered[key]
      )
      const res = await api.get("/cars", { params: filtered })
      setCars(res.data.data)
    } catch (err) {
      setError("Failed to fetch cars. Please try again later.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }
  

  const handleFilterSubmit = (e) => {
    e.preventDefault()
    applyFilters()
  }

  const applyFilters = () => {
    const params = new URLSearchParams()

    if (filters.make) params.append("make", filters.make)
    if (filters.model) params.append("model", filters.model)
    if (filters.minPrice) params.append("minPrice", filters.minPrice)
    if (filters.maxPrice) params.append("maxPrice", filters.maxPrice)
    if (filters.forRent) params.append("forRent", filters.forRent)
    if (filters.forSale) params.append("forSale", filters.forSale)

    window.history.pushState({}, "", `${window.location.pathname}?${params.toString()}`)
    
    // Trigger the useEffect to refetch cars
    location.search = params.toString()
  }

  const clearFilters = () => {
    setFilters({
      make: "",
      model: "",
      minPrice: "",
      maxPrice: "",
      forRent: false,
      forSale: false,
    })
    
    window.history.pushState({}, "", window.location.pathname)
    
    // Trigger the useEffect to refetch cars
    location.search = ""
  }

  return (
    <div className="car-listings-page">
      <div className="container">
        <h1>Car Listings</h1>

        <div className="car-listings-content">
          <aside className="filters-sidebar">
            <Card>
              <CardBody>
                <h2>Filters</h2>
                <form onSubmit={handleFilterSubmit}>
                  <FormInput
                    label="Make"
                    type="text"
                    id="make"
                    name="make"
                    value={filters.make}
                    placeholder="e.g. Toyota, Honda"
                    onChange={handleFilterChange}
                  />
                  <FormInput
                    label="Model"
                    type="text"
                    id="model"
                    name="model"
                    value={filters.model}
                    placeholder="e.g. Camry, Civic"
                    onChange={handleFilterChange}
                  />
                  <div className="price-range">
                    <FormInput
                      label="Min Price"
                      type="number"
                      id="minPrice"
                      name="minPrice"
                      value={filters.minPrice}
                      placeholder="Min"
                      onChange={handleFilterChange}
                    />
                    <FormInput
                      label="Max Price"
                      type="number"
                      id="maxPrice"
                      name="maxPrice"
                      value={filters.maxPrice}
                      placeholder="Max"
                      onChange={handleFilterChange}
                    />
                  </div>

                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="forSale"
                        checked={filters.forSale}
                        onChange={handleFilterChange}
                      />
                      For Sale
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="forRent"
                        checked={filters.forRent}
                        onChange={handleFilterChange}
                      />
                      For Rent
                    </label>
                  </div>

                  <div className="filter-actions">
                    <Button type="submit">Apply Filters</Button>
                    <Button type="button" variant="secondary" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  </div>
                </form>
              </CardBody>
            </Card>
          </aside>

          <div className="car-grid">
            {loading ? (
              <div className="spinner-container">
                <Spinner />
              </div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : cars.length === 0 ? (
              <div className="no-cars-message">
                <p>No cars found matching your criteria.</p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            ) : (
              cars.map((car) => (
                <Card key={car._id} className="car-card">
                  <div className="car-image">
                    <img src={car.images[0] || "/placeholder-car.jpg"} alt={`${car.make} ${car.model}`} />
                    <div className="car-badges-container">
                      {car.forSale && <span className="car-badge sale-badge">For Sale</span>}
                      {car.forRent && <span className="car-badge rent-badge">For Rent</span>}
                      {!car.available && <span className="car-badge unavailable-badge">Unavailable</span>}
                      {isOwner(car) && <span className="car-badge owner-badge">Your Listing</span>}
                    </div>
                  </div>
                  <CardBody>
                    <h3>{`${car.make} ${car.model} (${car.year})`}</h3>
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
                    </div>
                    <div className="car-price">
                      {car.forSale && (
                        <p className="sale-price">
                          <strong>Price:</strong> ${car.price.toLocaleString()}
                        </p>
                      )}
                      {car.forRent && car.rentalPrice && (
                        <p className="rental-price">
                          <strong>Rental:</strong> ${car.rentalPrice.daily}/day
                        </p>
                      )}
                    </div>
                    <div className="car-actions-container">
                      <Link to={`/cars/${car._id}`}>
                        <Button variant="primary" fullWidth>View Details</Button>
                      </Link>
                      {isAuthenticated && car.forSale && car.available && !isOwner(car) && (
                        <Link to={`/sell?carId=${car._id}`}>
                          <Button variant="success" fullWidth>Buy Now</Button>
                        </Link>
                      )}
                    </div>
                  </CardBody>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CarListingsPage
