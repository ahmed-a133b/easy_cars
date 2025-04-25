"use client"
import api from "../api"
import { useState, useEffect, useContext } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { AuthContext } from "../context/AuthContext"
import Card from "../components/ui/Card"
import { CardBody, CardFooter } from "../components/ui/Card"
import Button from "../components/ui/Button"
import FormInput from "../components/ui/FormInput"
import Spinner from "../components/ui/Spinner"
import "./ForumPage.css"

const ForumPage = () => {
  const { isAuthenticated } = useContext(AuthContext)

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")

  const categories = ["General", "Question", "Car Reviews", "Buying Advice", "Selling Tips", "Maintenance", "Other"]

  // Modified useEffect to fetch posts when selectedCategory changes
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true)
      try {
        const params = {}
        if (selectedCategory) params.category = selectedCategory

        const res = await api.get("/forum", { params })
        setPosts(res.data.data)
      } catch (err) {
        setError("Failed to fetch forum posts. Please try again later.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [selectedCategory])

  // Function to handle searching posts
  const searchPosts = async (search = "") => {
    setLoading(true)
    try {
      const params = {}
      if (selectedCategory) params.category = selectedCategory
      if (search) params.search = search

      const res = await api.get("/forum", { params })
      setPosts(res.data.data)
    } catch (err) {
      setError("Failed to fetch forum posts. Please try again later.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Handle search input change
  const handleSearch = (e) => {
    e.preventDefault()
    searchPosts(searchTerm)
  }

  // Handle category selection
  const handleCategoryChange = (category) => {
    setSelectedCategory(category === selectedCategory ? "" : category)
  }

  // Format date to a readable format
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <div className="forum-page">
      <div className="container">
        <div className="forum-header">
          <h1>Car Enthusiasts Forum</h1>
          <p>Join the conversation with fellow car enthusiasts.</p>

          {isAuthenticated ? (
            <Link to="/forum/new">
              <Button>Create New Post</Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button>Login to Post</Button>
            </Link>
          )}
        </div>

        <div className="forum-content">
          <aside className="forum-sidebar">
            <Card>
              <CardBody>
                <form onSubmit={handleSearch} className="search-form">
                  <FormInput
                    type="text"
                    placeholder="Search posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button type="submit" size="small">
                    Search
                  </Button>
                </form>

                <div className="categories">
                  <h3>Categories</h3>
                  <ul className="category-list">
                    <li className={selectedCategory === "" ? "active" : ""} onClick={() => handleCategoryChange("")}>
                      All Categories
                    </li>
                    {categories.map((category) => (
                      <li
                        key={category}
                        className={selectedCategory === category ? "active" : ""}
                        onClick={() => handleCategoryChange(category)}
                      >
                        {category}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardBody>
            </Card>
          </aside>

          <div className="forum-posts">
            {loading ? (
              <div className="spinner-container">
                <Spinner />
              </div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : posts.length === 0 ? (
              <div className="no-posts">
                <p>No posts found. Be the first to start a discussion!</p>
                {isAuthenticated && (
                  <Link to="/forum/new">
                    <Button>Create New Post</Button>
                  </Link>
                )}
              </div>
            ) : (
              posts.map((post) => (
                <Card key={post._id} className="post-card">
                  <CardBody>
                    <div className="post-header">
                      <Link to={`/forum/${post._id}`} className="post-title">
                        <h2>{post.title}</h2>
                      </Link>
                      <span className="post-category">{post.category}</span>
                    </div>
                    <div className="post-meta">
                      <span className="post-author">Posted by {post.user.name}</span>
                      <span className="post-date">{formatDate(post.createdAt)}</span>
                    </div>
                    <div className="post-preview">
                      <p>{post.content.length > 200 ? `${post.content.substring(0, 200)}...` : post.content}</p>
                    </div>
                    <div className="post-stats">
                      <span className="post-comments">
                        <i className="icon-comment"></i>
                        {post.comments.length} comments
                      </span>
                      <span className="post-votes">
                        <i className="icon-thumbs-up"></i>
                        {post.upvotes.length} upvotes
                      </span>
                    </div>
                  </CardBody>
                  <CardFooter>
                    <Link to={`/forum/${post._id}`}>
                      <Button variant="outline" size="small">
                        Read More
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForumPage
