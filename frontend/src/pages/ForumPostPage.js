"use client"
import api from "../api"
import { useState, useEffect, useContext, useCallback } from "react"
import { useParams, Link, useHistory } from "react-router-dom"
import axios from "axios"
import { AuthContext } from "../context/AuthContext"
import Card from "../components/ui/Card"
import { CardHeader, CardBody, CardFooter } from "../components/ui/Card"
import Button from "../components/ui/Button"
import Alert from "../components/ui/Alert"
import Spinner from "../components/ui/Spinner"
import "./ForumPostPage.css"

const ForumPostPage = () => {
  const { id } = useParams()
  const history = useHistory()
  const { isAuthenticated, user } = useContext(AuthContext)

  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [commentText, setCommentText] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [commentError, setCommentError] = useState("")
  
  // For creating a new post
  const [newPostTitle, setNewPostTitle] = useState("")
  const [newPostContent, setNewPostContent] = useState("")
  const [newPostCategory, setNewPostCategory] = useState("General")
  const [newPostTags, setNewPostTags] = useState("")
  const [createPostError, setCreatePostError] = useState("")

  // Use useCallback to memoize the fetchPost function
  const fetchPost = useCallback(async () => {
    // Skip fetching if we're on the "new" page
    if (id === "new") {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const res = await api.get(`/forum/${id}`);
      setPost(res.data.data);
    } catch (err) {
      setError("Failed to fetch post. Please try again later.");
      console.error("Error response:", err.response?.data);
      console.error("Error message:", err.message);
      console.error("Full error:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      history.push("/login", { from: `/forum/${id}` });
      return;
    }

    if (!commentText.trim()) {
      setCommentError("Comment cannot be empty.");
      return;
    }

    setSubmitting(true);
    setCommentError("");

    try {
      await api.post(`/forum/${id}/comments`, { text: commentText });
      setCommentText("");
      fetchPost(); // Refresh post to show new comment
    } catch (err) {
      setCommentError(err.response?.data?.message || "Failed to post comment. Please try again.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (action) => {
    if (!isAuthenticated) {
      history.push("/login", { from: `/forum/${id}` });
      return;
    }

    try {
      await api.put(`/forum/${id}/like`, { action });
      fetchPost(); // Refresh post to update votes
    } catch (err) {
      console.error("Failed to vote:", err);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      history.push("/login", { from: "/forum/new" });
      return;
    }

    if (!newPostTitle.trim() || !newPostContent.trim()) {
      setCreatePostError("Title and content are required.");
      return;
    }

    setSubmitting(true);
    setCreatePostError("");

    try {
      // Prepare tags as an array if provided
      const tagsArray = newPostTags
        ? newPostTags.split(",").map(tag => tag.trim())
        : [];

      const postData = {
        title: newPostTitle,
        content: newPostContent,
        category: newPostCategory,
        tags: tagsArray
      };

      const res = await api.post("/forum", postData);
      
      // Redirect to the newly created post
      history.push(`/forum/${res.data.data._id}`);
    } catch (err) {
      setCreatePostError(err.response?.data?.message || "Failed to create post. Please try again.");
      console.error("Error creating post:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const hasUserUpvoted = () => {
    return post?.upvotes.includes(user?._id);
  };

  const hasUserDownvoted = () => {
    return post?.downvotes.includes(user?._id);
  };

  // Render create post form if id is "new"
  if (id === "new") {
    if (!isAuthenticated) {
      return (
        <div className="container">
          <div className="login-prompt">
            <p>Please log in to create a new post.</p>
            <Link to="/login">
              <Button>Login</Button>
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="forum-post-page">
        <div className="container">
          <div className="post-navigation">
            <Link to="/forum">
              <Button variant="outline" size="small">
                Back to Forum
              </Button>
            </Link>
          </div>

          <Card className="post-card">
            <CardHeader>
              <h1>Create New Post</h1>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleCreatePost}>
                {createPostError && <Alert message={createPostError} type="error" onClose={() => setCreatePostError("")} />}
                
                <div className="form-group">
                  <label htmlFor="title">Title</label>
                  <input
                    type="text"
                    id="title"
                    className="form-input"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    placeholder="Enter post title"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    className="form-select"
                    value={newPostCategory}
                    onChange={(e) => setNewPostCategory(e.target.value)}
                  >
                    <option value="General">General</option>
                    <option value="Question">Question</option>
                    <option value="Discussion">Discussion</option>
                    <option value="Announcement">Announcement</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="content">Content</label>
                  <textarea
                    id="content"
                    className="form-textarea"
                    rows="10"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Write your post content here..."
                    required
                  ></textarea>
                </div>

                <div className="form-group">
                  <label htmlFor="tags">Tags (comma separated)</label>
                  <input
                    type="text"
                    id="tags"
                    className="form-input"
                    value={newPostTags}
                    onChange={(e) => setNewPostTags(e.target.value)}
                    placeholder="e.g. help, feature, bug"
                  />
                </div>

                <Button type="submit" disabled={submitting}>
                  {submitting ? "Creating..." : "Create Post"}
                </Button>
              </form>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="spinner-container">
        <Spinner />
      </div>
    );
  }

  if (error || post === null) {
    return (
      <div className="container">
        <div className="error-message">
          <p>{error || "Post not found or could not be loaded."}</p>
          <Link to="/forum">
            <Button>Back to Forum</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="forum-post-page">
      <div className="container">
        <div className="post-navigation">
          <Link to="/forum">
            <Button variant="outline" size="small">
              Back to Forum
            </Button>
          </Link>
        </div>

        <Card className="post-card">
          <CardHeader>
            <div className="post-header">
              <h1>{post.title}</h1>
              <span className="post-category">{post.category}</span>
            </div>
            <div className="post-meta">
              <span className="post-author">Posted by {post.user.name}</span>
              <span className="post-date">{formatDate(post.createdAt)}</span>
            </div>
          </CardHeader>
          <CardBody>
            <div className="post-content">
              <p>{post.content}</p>
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="post-tags">
                {post.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </CardBody>
          <CardFooter>
            <div className="post-actions">
              <div className="vote-buttons">
                <button
                  className={`vote-button upvote ${hasUserUpvoted() ? "active" : ""}`}
                  onClick={() => handleVote("upvote")}
                  disabled={!isAuthenticated}
                >
                  <i className="icon-thumbs-up"></i>
                  <span>{post.upvotes.length}</span>
                </button>
                <button
                  className={`vote-button downvote ${hasUserDownvoted() ? "active" : ""}`}
                  onClick={() => handleVote("downvote")}
                  disabled={!isAuthenticated}
                >
                  <i className="icon-thumbs-down"></i>
                  <span>{post.downvotes.length}</span>
                </button>
              </div>
            </div>
          </CardFooter>
        </Card>

        <div className="comments-section">
          <h2>Comments ({post.comments.length})</h2>

          <Card className="comment-form-card">
            <CardBody>
              {isAuthenticated ? (
                <form onSubmit={handleCommentSubmit}>
                  {commentError && <Alert message={commentError} type="error" onClose={() => setCommentError("")} />}
                  <div className="form-group">
                    <label htmlFor="comment">Add a comment</label>
                    <textarea
                      id="comment"
                      className="form-textarea"
                      rows="3"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write your comment here..."
                    ></textarea>
                  </div>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Posting..." : "Post Comment"}
                  </Button>
                </form>
              ) : (
                <div className="login-prompt">
                  <p>Please log in to comment on this post.</p>
                  <Link to="/login">
                    <Button>Login</Button>
                  </Link>
                </div>
              )}
            </CardBody>
          </Card>

          {post.comments.length === 0 ? (
            <div className="no-comments">
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            <div className="comments-list">
              {post.comments.map((comment, index) => (
                <Card key={index} className="comment-card">
                  <CardBody>
                    <div className="comment-header">
                      <span className="comment-author">{comment.user.name}</span>
                      <span className="comment-date">{formatDate(comment.createdAt)}</span>
                    </div>
                    <div className="comment-content">
                      <p>{comment.text}</p>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForumPostPage;