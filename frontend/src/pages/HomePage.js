// import { useContext } from "react";

// import { Link } from "react-router-dom"
// import { AuthContext } from "../context/AuthContext"
// import Button from "../components/ui/Button"
// import "./HomePage.css"

// const HomePage = () => {
//   const { user } = useContext(AuthContext);

//   return (
//     <div className="home-page">
//       <section className="hero">
//         <div className="container">
//           <div className="hero-content">
//             <h1>Find Your Perfect Car</h1>
//             <p>
//               Easy Cars provides an all-in-one platform for renting, buying, and discussing cars. Join our community
//               today!
//             </p>
//             <div className="hero-buttons">
//               <Link to="/cars">
//                 <Button size="large">Browse Cars</Button>
//               </Link>
//               {!user && (
//                 <Link to="/register">
//                   <Button variant="secondary" size="large">
//                     Sign Up
//                   </Button>
//                 </Link>
//               )}
//             </div>
//           </div>
//         </div>
//       </section>

//       <section className="features">
//         <div className="container">
//           <h2>Our Services</h2>
//           <div className="features-grid">
//             <div className="feature-card">
//               <div className="feature-icon">🚗</div>
//               <h3>Rent a Car</h3>
//               <p>Choose from our wide selection of vehicles for your short or long-term rental needs.</p>
//               <Link to="/cars?forRent=true">
//                 <Button variant="outline">Rent Now</Button>
//               </Link>
//             </div>
//             <div className="feature-card">
//               <div className="feature-icon">🛒</div>
//               <h3>Buy a Car</h3>
//               <p>Find your car from our extensive inventory of quality vehicles.</p>
//               <Link to="/cars?forSale=true">
//                 <Button variant="outline">Shop Cars</Button>
//               </Link>
//             </div>
//             <div className="feature-card">
//               <div className="feature-icon">💬</div>
//               <h3>Join the Forum</h3>
//               <p>Connect with other car enthusiasts and share your automotive experiences.</p>
//               <Link to="/forum">
//                 <Button variant="outline">Visit Forum</Button>
//               </Link>
//             </div>
//           </div>
//         </div>
//       </section>

//       <section className="dealerships">
//         <div className="container">
//           <h2>Our Dealerships</h2>
//           <p>Visit one of our many dealership locations for personalized service and expert advice.</p>
//           <Link to="/dealerships">
//             <Button>Find a Dealership</Button>
//           </Link>
//         </div>
//       </section>
//     </div>
//   )
// }

// export default HomePage

import { useContext, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import Button from "../components/ui/Button"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Pagination } from "swiper/modules"
import "swiper/css"
import "swiper/css/pagination"
import "./HomePage.css"

const HomePage = () => {
  const { user } = useContext(AuthContext)
  const [featuredCars, setFeaturedCars] = useState([])

  // Fetching featured cars data
  useEffect(() => {
    const fetchFeaturedCars = async () => {
      try {
        const res = await fetch("/api/cars/featured")
        const data = await res.json()
        setFeaturedCars(data)
      } catch (err) {
        console.error("Error fetching featured cars:", err)
      }
    }

    fetchFeaturedCars()
  }, [])

  return (
    <div className="home-page">
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Find Your Perfect Car</h1>
            <p>
              Easy Cars provides an all-in-one platform for renting, buying, and discussing cars. Join our community
              today!
            </p>
            <div className="hero-buttons">
              <Link to="/cars">
                <Button size="large">Browse Cars</Button>
              </Link>
              {!user && (
                <Link to="/register">
                  <Button variant="secondary" size="large">
                    Sign Up
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      
      {featuredCars.length > 0 && (
        <section className="featured-cars">
          <div className="container">
            <h2>Featured Cars</h2>
            <Swiper
              modules={[Autoplay, Pagination]}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              pagination={{ clickable: true }}
              spaceBetween={20}
              slidesPerView={1}
              breakpoints={{
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
            >
              {featuredCars.map((car) => (
                <SwiperSlide key={car._id}>
                  <div className="car-card">
                    <img
                      src={car.images?.[0] || "/images/default-car.jpg"}
                      alt={`${car.make} ${car.model}`}
                    />
                    <div className="car-info">
                      <h3>{car.make} {car.model}</h3>
                      <p>{car.year} • ${car.price.toLocaleString()}</p>
                      <Link to={`/cars/${car._id}`}>
                        <Button size="small">View Details</Button>
                      </Link>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>
      )}

      <section className="features">
        <div className="container">
          <h2>Our Services</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚗</div>
              <h3>Rent a Car</h3>
              <p>Choose from our wide selection of vehicles for your short or long-term rental needs.</p>
              <Link to="/cars?forRent=true">
                <Button variant="outline">Rent Now</Button>
              </Link>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🛒</div>
              <h3>Buy a Car</h3>
              <p>Find your car from our extensive inventory of quality vehicles.</p>
              <Link to="/cars?forSale=true">
                <Button variant="outline">Shop Cars</Button>
              </Link>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>Join the Forum</h3>
              <p>Connect with other car enthusiasts and share your automotive experiences.</p>
              <Link to="/forum">
                <Button variant="outline">Visit Forum</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="dealerships">
        <div className="container">
          <h2>Our Dealerships</h2>
          <p>Visit one of our many dealership locations for personalized service and expert advice.</p>
          <Link to="/dealerships">
            <Button>Find a Dealership</Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

export default HomePage

