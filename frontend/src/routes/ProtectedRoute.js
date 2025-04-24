"use client"

import { useContext } from "react"
import { Route, Redirect } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import Spinner from "../components/ui/Spinner"

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const { isAuthenticated, loading } = useContext(AuthContext)

  return (
    <Route
      {...rest}
      render={(props) =>
        loading ? (
          <div className="spinner-container">
            <Spinner />
          </div>
        ) : isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: props.location },
            }}
          />
        )
      }
    />
  )
}

export default ProtectedRoute
