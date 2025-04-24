"use client"

import { useContext } from "react"
import { Route, Redirect } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import Spinner from "../components/ui/Spinner"

const AdminRoute = ({ component: Component, ...rest }) => {
  const { isAuthenticated, loading, user } = useContext(AuthContext)

  return (
    <Route
      {...rest}
      render={(props) =>
        loading ? (
          <div className="spinner-container">
            <Spinner />
          </div>
        ) : isAuthenticated && user?.role === "admin" ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: "/",
              state: { from: props.location },
            }}
          />
        )
      }
    />
  )
}

export default AdminRoute
