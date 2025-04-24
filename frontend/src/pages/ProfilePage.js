"use client"
import api from "../api"
import { useState, useEffect, useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import axios from "axios"
import Card from "../components/ui/Card"
import { CardHeader, CardBody } from "../components/ui/Card"
import Button from "../components/ui/Button"
import FormInput from "../components/ui/FormInput"
import Alert from "../components/ui/Alert"
import Spinner from "../components/ui/Spinner"
import "./ProfilePage.css"

const ProfilePage = () => {
  const { user, updateProfile } = useContext(AuthContext)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
  })
  const [rentals, setRentals] = useState([])
  const [sales, setSales] = useState([])
  const [activeTab, setActiveTab] = useState("profile")
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [alertType, setAlertType] = useState("")

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        address: {
          street: user.address?.street || "",
          city: user.address?.city || "",
          state: user.address?.state || "",
          zipCode: user.address?.zipCode || "",
          country: user.address?.country || "",
        },
      })
    }
  }, [user])

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [rentalsRes, salesRes] = await Promise.all([
          api.get("/users/rentals"),
          api.get("/users/sales"),
        ])

        setRentals(rentalsRes.data.data)
        setSales(salesRes.data.data)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching user data:", error)
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

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
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUpdating(true)

    try {
      await updateProfile(formData)
      setAlertMessage("Profile updated successfully")
      setAlertType("success")
    } catch (error) {
      setAlertMessage(error.response?.data?.message || "Failed to update profile")
      setAlertType("error")
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="spinner-container">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="profile-page">
      <div className="container">
        <h1>My Profile</h1>

        <div className="profile-tabs">
          <button
            className={`tab-button ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </button>
          <button
            className={`tab-button ${activeTab === "rentals" ? "active" : ""}`}
            onClick={() => setActiveTab("rentals")}
          >
            My Rentals
          </button>
          <button
            className={`tab-button ${activeTab === "purchases" ? "active" : ""}`}
            onClick={() => setActiveTab("purchases")}
          >
            My Purchases
          </button>
        </div>

        {activeTab === "profile" && (
          <Card className="profile-card">
            <CardHeader>
              <h2>Edit Profile</h2>
            </CardHeader>
            <CardBody>
              {alertMessage && (
                <Alert message={alertMessage} type={alertType} onClose={() => setAlertMessage("")} duration={5000} />
              )}
              <form onSubmit={handleSubmit}>
                <FormInput
                  label="Name"
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
                <FormInput label="Email" type="email" id="email" value={user?.email} disabled />
                <FormInput
                  label="Phone"
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />

                <h3 className="address-heading">Address</h3>
                <div className="address-fields">
                  <FormInput
                    label="Street"
                    type="text"
                    id="street"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                  />
                  <FormInput
                    label="City"
                    type="text"
                    id="city"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                  />
                  <FormInput
                    label="State/Province"
                    type="text"
                    id="state"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                  />
                  <FormInput
                    label="Zip/Postal Code"
                    type="text"
                    id="zipCode"
                    name="address.zipCode"
                    value={formData.address.zipCode}
                    onChange={handleChange}
                  />
                  <FormInput
                    label="Country"
                    type="text"
                    id="country"
                    name="address.country"
                    value={formData.address.country}
                    onChange={handleChange}
                  />
                </div>

                <Button type="submit" disabled={updating}>
                  {updating ? "Updating..." : "Update Profile"}
                </Button>
              </form>
            </CardBody>
          </Card>
        )}

        {activeTab === "rentals" && (
          <Card className="rentals-card">
            <CardHeader>
              <h2>My Rentals</h2>
            </CardHeader>
            <CardBody>
              {rentals.length === 0 ? (
                <p className="no-data">You have no rental history yet.</p>
              ) : (
                <div className="rentals-list">
                  {rentals.map((rental) => (
                    <div key={rental._id} className="rental-item">
                      <div className="rental-image">
                        <img
                          src={rental.car.images[0] || "/placeholder-car.jpg"}
                          alt={`${rental.car.make} ${rental.car.model}`}
                        />
                      </div>
                      <div className="rental-details">
                        <h3>{`${rental.car.make} ${rental.car.model} (${rental.car.year})`}</h3>
                        <p>
                          <strong>Rental Period:</strong> {new Date(rental.startDate).toLocaleDateString()} to{" "}
                          {new Date(rental.endDate).toLocaleDateString()}
                        </p>
                        <p>
                          <strong>Total Price:</strong> ${rental.totalPrice.toFixed(2)}
                        </p>
                        <p>
                          <strong>Status:</strong>{" "}
                          <span className={`status status-${rental.status}`}>
                            {rental.status.charAt(0).toUpperCase() + rental.status.slice(1)}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {activeTab === "purchases" && (
          <Card className="purchases-card">
            <CardHeader>
              <h2>My Purchases</h2>
            </CardHeader>
            <CardBody>
              {sales.length === 0 ? (
                <p className="no-data">You have no purchase history yet.</p>
              ) : (
                <div className="sales-list">
                  {sales.map((sale) => (
                    <div key={sale._id} className="sale-item">
                      <div className="sale-image">
                        <img
                          src={sale.car.images[0] || "/placeholder-car.jpg"}
                          alt={`${sale.car.make} ${sale.car.model}`}
                        />
                      </div>
                      <div className="sale-details">
                        <h3>{`${sale.car.make} ${sale.car.model} (${sale.car.year})`}</h3>
                        <p>
                          <strong>Purchase Date:</strong> {new Date(sale.saleDate).toLocaleDateString()}
                        </p>
                        <p>
                          <strong>Price:</strong> ${sale.price.toFixed(2)}
                        </p>
                        <p>
                          <strong>Status:</strong>{" "}
                          <span className={`status status-${sale.paymentStatus}`}>
                            {sale.paymentStatus.charAt(0).toUpperCase() + sale.paymentStatus.slice(1)}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  )
}

export default ProfilePage
