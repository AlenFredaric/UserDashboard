import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Navbar({ onLogout, user }) {
  return (
    <nav className="navbar">
      <h1>{'TrackPi'}</h1>
      {user && <button onClick={onLogout}>Logout</button>}
    </nav>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const register = async () => {
    if (!name || !email || !password) {
      toast.error('All fields are required');
      return;
    }
  
    // Email validation using regular expression
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
  
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
  
    try {
      await axios.post('http://localhost:5000/api/register', { name, email, password });
      setIsRegistering(false);
      toast.success('Registration successful!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  const login = async () => {
    if (!email || !password) {
      toast.error('All fields are required');
      return;
    }
    try {
      const res = await axios.post('http://localhost:5000/api/login', { email, password });
      localStorage.setItem('token', res.data.token);
      fetchUser();
      toast.success('Login successful!');
    } catch (err) {
      toast.error('Invalid credentials');
    }
  };

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const res = await axios.get('http://localhost:5000/api/user', {
      headers: { Authorization: token },
    });
    setUser(res.data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.info('Logged out successfully');
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <div className="container">
      <ToastContainer />
      <Navbar onLogout={logout} user={user} />
      <div className="auth-container">
        {!user ? (
          isRegistering ? (
            <>
              <h2>Register</h2>
              <input type="text" placeholder="Name" onChange={(e) => setName(e.target.value)} />
              <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
              <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
              <button onClick={register}>Register</button>
              <button onClick={() => setIsRegistering(false)}>Go to Login</button>
            </>
          ) : (
            <>
              <h2>Login</h2>
              <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
              <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
              <button onClick={login}>Login</button>
              <button onClick={() => setIsRegistering(true)}>Go to Register</button>
            </>
          )
        ) : (
          <div className="dashboard">
            <h2>Welcome, {user.name}</h2>
            <p>Email: {user.email}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;