import { BrowserRouter as Router, Route, Switch } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { ThemeProvider } from "./context/ThemeContext"
import Header from "./components/layout/Header"
import Footer from "./components/layout/Footer"
import HomePage from "./pages/HomePage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import ProfilePage from "./pages/ProfilePage"
import CarListingsPage from "./pages/CarListingsPage"
import CarDetailPage from "./pages/CarDetailPage"
import RentCarPage from "./pages/RentCarPage"
import SellCarPage from "./pages/SellCarPage"
import ForumPage from "./pages/ForumPage"
import ForumPostPage from "./pages/ForumPostPage"
import DealershipsPage from "./pages/DealershipsPage"
import AdminDashboard from "./pages/AdminDashboard"
import ProtectedRoute from "./routes/ProtectedRoute"
import AdminRoute from "./routes/AdminRoute"
import "./App.css"

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <div className="app-container">
            <Header />
            <main className="main-content">
              <Switch>
                <Route exact path="/" component={HomePage} />
                <Route path="/login" component={LoginPage} />
                <Route path="/register" component={RegisterPage} />
                <ProtectedRoute path="/profile" component={ProfilePage} />
                <Route path="/cars" exact component={CarListingsPage} />
                <Route path="/cars/:id" exact component={CarDetailPage} />
                <ProtectedRoute path="/rent/:id" component={RentCarPage} />
                <ProtectedRoute path="/sell" component={SellCarPage} />
                <Route path="/forum" exact component={ForumPage} />
                <Route path="/forum/:id" component={ForumPostPage} />
                <Route path="/dealerships" component={DealershipsPage} />
                <AdminRoute path="/admin" component={AdminDashboard} />
              </Switch>
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
