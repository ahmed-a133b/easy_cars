"use client"
import api from "../api"
import { createContext, useState, useEffect } from "react"


export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem("token"))
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load user on initial render
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        setAuthToken(token)
        try {
          const res = await api.get("/auth/profile")
          setUser(res.data.data)
          setIsAuthenticated(true)
          // Clear any auth errors when successfully authenticated
          setError(null)
        } catch (err) {
          localStorage.removeItem("token")
          setToken(null)
          setUser(null)
          setIsAuthenticated(false)
          setError(err.response?.data?.message || "Authentication failed")
        }
      }
      setLoading(false)
    }

    loadUser()
  }, [token])

  // Set token in headers
  const setAuthToken = (token) => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`
      localStorage.setItem("token", token)
    } else {
      delete api.defaults.headers.common["Authorization"]
      localStorage.removeItem("token")
    }
  }

  // Register user
  const register = async (formData) => {
    // Clear any previous errors before attempting registration
    setError(null)
    
    try {
      console.log('Registering with:', formData);
      const res = await api.post("/auth/register", formData)

      setToken(res.data.token)
      setUser(res.data.user)
      setIsAuthenticated(true)
      setLoading(false)

      return res.data
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed")
      throw err
    }
  }

  // Login user
  const login = async (formData) => {
    // Clear any previous errors before attempting login
    setError(null)
    
    try {
      const res = await api.post("/auth/login", formData)

      setToken(res.data.token)
      setUser(res.data.user)
      setIsAuthenticated(true)
      setLoading(false)

      return res.data
    } catch (err) {
      setError(err.response?.data?.message || "Login failed")
      throw err
    }
  }

  // Logout user
  const logout = () => {
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
    setError(null)
  }

  // Clear any authentication errors
  const clearError = () => {
    setError(null)
  }

  // Update user profile
  const updateProfile = async (formData) => {
    // Clear any previous errors before attempting profile update
    setError(null)
    
    try {
      const res = await api.put("/users/update-profile", formData)

      setUser(res.data.data)

      return res.data
    } catch (err) {
      setError(err.response?.data?.message || "Profile update failed")
      throw err
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout,
        updateProfile,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
