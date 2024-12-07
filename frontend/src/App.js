import React, { useState, useEffect } from "react";
import axios from "axios";

const App = () => {
  const [currentPage, setCurrentPage] = useState("home");
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [postContent, setPostContent] = useState("");
  const [editingPost, setEditingPost] = useState(null);
  const [originalContent, setOriginalContent] = useState("");
  const [viewingUser, setViewingUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("loggedInUser");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setLoggedInUser(user);
      fetchUserPosts(user.username);
    }
    fetchAllPosts();
  }, []);

  const fetchAllPosts = async () => {
    try {
      const response = await axios.get("http://localhost:5001/posts");
      setAllPosts(response.data.posts);
    } catch (err) {
      console.error("Failed to fetch all posts", err);
    }
  };

  const fetchUserPosts = async (username) => {
    try {
      const response = await axios.get(`http://localhost:5001/posts/${username}`);
      setPosts(response.data.posts);
    } catch (err) {
      console.error("Failed to fetch user posts", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePostContentChange = (e) => {
    setPostContent(e.target.value);
  };

  const handleEditContentChange = (e, postId) => {
    setPosts(
      posts.map((post) =>
        post._id === postId ? { ...post, content: e.target.value } : post
      )
    );
  };

  const handleSignup = async () => {
    try {
      const response = await axios.post("http://localhost:5001/signup", formData);
      const user = response.data.user;
      setLoggedInUser(user);
      localStorage.setItem("loggedInUser", JSON.stringify(user));
      setFormData({ username: "", password: "" });
      setMessage("");
      setCurrentPage("home");
      fetchUserPosts(user.username);
    } catch (err) {
      setMessage(err.response?.data?.error || "Signup error");
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:5001/login", formData);
      const user = response.data.user;
      setLoggedInUser(user);
      localStorage.setItem("loggedInUser", JSON.stringify(user));
      setFormData({ username: "", password: "" });
      setMessage("");
      setCurrentPage("home");
      fetchUserPosts(user.username);
    } catch (err) {
      setMessage(err.response?.data?.error || "Login error");
    }
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    setPosts([]);
    localStorage.removeItem("loggedInUser");
    setCurrentPage("home");
  };

  const handleCreatePost = async () => {
    try {
      const response = await axios.post("http://localhost:5001/posts", {
        username: loggedInUser.username,
        content: postContent,
      });
      setPosts([response.data.post, ...posts]);
      setPostContent("");
      fetchAllPosts();
    } catch (err) {
      console.error("Failed to create post", err);
    }
  };

  const handleEditPost = async (postId) => {
    const postToUpdate = posts.find((post) => post._id === postId);
    try {
      const response = await axios.put(`http://localhost:5001/posts/${postId}`, {
        content: postToUpdate.content,
      });
      setPosts(
        posts.map((post) =>
          post._id === postId ? response.data.post : post
        )
      );
      setEditingPost(null);
      fetchAllPosts();
    } catch (err) {
      console.error("Failed to update post", err);
    }
  };

  const handleCancelEdit = (postId) => {
    setPosts(
      posts.map((post) =>
        post._id === postId ? { ...post, content: originalContent } : post
      )
    );
    setEditingPost(null);
  };

  const startEditingPost = (post) => {
    setEditingPost(post._id);
    setOriginalContent(post.content);
  };

  const handleDeletePost = async (postId) => {
    try {
      await axios.delete(`http://localhost:5001/posts/${postId}`);
      setPosts(posts.filter((post) => post._id !== postId));
      fetchAllPosts();
    } catch (err) {
      console.error("Failed to delete post", err);
    }
  };

  const navigateToUserPage = (username) => {
    setViewingUser(username);
    setCurrentPage("user");
    fetchUserPosts(username);
  };

  return (
    <div>
      <nav style={{ display: "flex", justifyContent: "space-between", padding: "1rem", background: "#ddd" }}>
        <button onClick={() => setCurrentPage("home")}>Home</button>
        <div>
          {loggedInUser ? (
            <div style={{ display: "flex", alignItems: "center" }}>
              <span
                style={{ cursor: "pointer", textDecoration: "underline" }}
                onClick={() => navigateToUserPage(loggedInUser.username)}
              >
                {loggedInUser.username}
              </span>
              <button onClick={handleLogout} style={{ marginLeft: "1rem" }}>Logout</button>
            </div>
          ) : (
            <>
              <button onClick={() => setCurrentPage("signup")}>Signup</button>
              <button onClick={() => setCurrentPage("login")}>Login</button>
            </>
          )}
        </div>
      </nav>

      <div style={{ padding: "1rem" }}>
        {currentPage === "home" && (
          <div>
            <h1>Home Page</h1>
            <h2>All Posts</h2>
            {allPosts.map((post) => (
              <div
                key={post._id}
                style={{
                  border: "1px solid #ddd",
                  padding: "1rem",
                  margin: "0.5rem 0",
                  cursor: "pointer",
                }}
                onClick={() => navigateToUserPage(post.username)}
              >
                <p>{post.content}</p>
                <small>
                  Posted on {new Date(post.createdAt).toLocaleString()} by {post.username}
                </small>
              </div>
            ))}
          </div>
        )}
        {currentPage === "signup" && !loggedInUser && (
          <div>
            <h2>Signup</h2>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleInputChange}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
            />
            <button onClick={handleSignup}>Signup</button>
            {message && <p>{message}</p>}
          </div>
        )}
        {currentPage === "login" && !loggedInUser && (
          <div>
            <h2>Login</h2>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleInputChange}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
            />
            <button onClick={handleLogin}>Login</button>
            {message && <p>{message}</p>}
          </div>
        )}
        {currentPage === "user" && (
          <div>
            <h1 style={{ fontSize: "2rem", textAlign: "center" }}>
              {viewingUser === loggedInUser?.username ? loggedInUser.username : viewingUser}
            </h1>
            {viewingUser === loggedInUser?.username ? (
              <>
                <p style={{ textAlign: "center" }}>
                  Signed up on: {new Date(loggedInUser.createdAt).toLocaleString()}
                </p>
                <div style={{ margin: "1rem 0" }}>
                  <textarea
                    placeholder="What's on your mind?"
                    value={postContent}
                    onChange={handlePostContentChange}
                    style={{ width: "100%", height: "80px" }}
                  />
                  <button onClick={handleCreatePost}>Post</button>
                </div>
              </>
            ) : null}
            <div>
              <h2>{viewingUser === loggedInUser?.username ? "Your Posts" : `${viewingUser}'s Posts`}</h2>
              {posts.map((post) => (
                <div
                  key={post._id}
                  style={{
                    border: "1px solid #ddd",
                    padding: "1rem",
                    margin: "0.5rem 0",
                  }}
                >
                  <p>{post.content}</p>
                  <small>
                    Posted on {new Date(post.createdAt).toLocaleString()} by {post.username}
                  </small>
                  {viewingUser === loggedInUser?.username && (
                    <div>
                      {editingPost === post._id ? (
                        <div>
                          <textarea
                            value={post.content}
                            onChange={(e) => handleEditContentChange(e, post._id)}
                            style={{ width: "100%", height: "60px" }}
                          />
                          <button onClick={() => handleEditPost(post._id)}>Save</button>
                          <button onClick={() => handleCancelEdit(post._id)}>Cancel</button>
                        </div>
                      ) : (
                        <div>
                          <button onClick={() => startEditingPost(post)}>Edit</button>
                          <button onClick={() => handleDeletePost(post._id)}>Delete</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
