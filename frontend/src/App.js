import React, { useState, useEffect } from 'react';

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [username, setUsername] = useState(null);

  useEffect(() => {
    // Check if user is logged in on page refresh
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('username');
    setUsername(null);
    setCurrentPage('home');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <h2>Welcome to the Home Page</h2>;
      case 'signup':
        return <Signup />;
      case 'login':
        return <Login />;
      default:
        return <h2>Page not found</h2>;
    }
  };

  const Navbar = () => (
    <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#eee' }}>
      <button onClick={() => setCurrentPage('home')}>Home</button>
      <div>
        {username ? (
          <span>
            {username} <button onClick={handleLogout}>Logout</button>
          </span>
        ) : (
          <>
            <button onClick={() => setCurrentPage('signup')}>Signup</button>
            <button onClick={() => setCurrentPage('login')}>Login</button>
          </>
        )}
      </div>
    </nav>
  );

  const Signup = () => (
    <div>
      <h2>Signup</h2>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const username = formData.get('username');
          const password = formData.get('password');

          const response = await fetch('http://localhost:5001/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
          });

          if (response.ok) {
            alert('Signup successful!');
            setCurrentPage('login');
          } else {
            alert('Signup failed. Try a different username.');
          }
        }}
      >
        <input type="text" name="username" placeholder="Username" required />
        <input type="password" name="password" placeholder="Password" required />
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );

  const Login = () => (
    <div>
      <h2>Login</h2>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const username = formData.get('username');
          const password = formData.get('password');

          const response = await fetch('http://localhost:5001/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
          });

          if (response.ok) {
            localStorage.setItem('username', username);
            setUsername(username);
            setCurrentPage('home');
          } else {
            alert('Invalid credentials.');
          }
        }}
      >
        <input type="text" name="username" placeholder="Username" required />
        <input type="password" name="password" placeholder="Password" required />
        <button type="submit">Log In</button>
      </form>
    </div>
  );

  return (
    <div>
      <Navbar />
      <main>{renderPage()}</main>
    </div>
  );
};

export default App;
