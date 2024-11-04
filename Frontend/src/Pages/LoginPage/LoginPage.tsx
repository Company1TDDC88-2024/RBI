import React, { useState } from 'react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>(''); // Change from username to email
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSignUp, setIsSignUp] = useState<boolean>(false);

  // New state variables for sign-up fields
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSignUp) {
      if (!firstName || !lastName || !email || !password) {
        setError('Please fill in all fields');
        return;
      }

      try {
        // Send sign-up data to the backend
        const response = await fetch('http://your-backend-url.com/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ firstName, lastName, email, password }),
        });

        const data = await response.json();
        
        if (response.ok) {
          alert('Sign-up successful! Please log in.');
          setIsSignUp(false); // Switch to login mode
          setError(''); // Clear any error messages
        } else {
          setError(data.message || 'Sign-up failed. Please try again.');
        }
      } catch (error) {
        setError('An error occurred. Please try again later.');
      }
    } else {
      // Login logic here
      if (!email || !password) {
        setError('Please fill in all fields');
        return;
      }

      try {
        // Send login data to the backend
        const response = await fetch('http://your-backend-url.com/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          alert('Login successful!');
          // Here, store the token in sessionStorage if needed
          // sessionStorage.setItem('authToken', data.token); // Assuming your backend sends back a token
        } else {
          setError(data.message || 'Login failed. Please try again.');
        }
      } catch (error) {
        setError('An error occurred. Please try again later.');
      }
    }
  };

  return (
    <div className="login-page">
      <h2>{isSignUp ? 'Sign Up' : 'Login'}</h2>
      <form onSubmit={handleSubmit}>
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {isSignUp && (
          <>
            <div>
              <label htmlFor="firstName">First Name:</label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your first name"
              />
            </div>

            <div>
              <label htmlFor="lastName">Last Name:</label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter your last name"
              />
            </div>
          </>
        )}

        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>

        <button type="submit">{isSignUp ? 'Sign Up' : 'Login'}</button>
      </form>

      <p>
        {isSignUp ? (
          <>
            Already have an account?{' '}
            <span onClick={() => setIsSignUp(false)} style={{ color: 'blue', cursor: 'pointer' }}>
              Log in
            </span>
          </>
        ) : (
          <>
            Don’t have an account?{' '}
            <span onClick={() => setIsSignUp(true)} style={{ color: 'blue', cursor: 'pointer' }}>
              Sign up
            </span>
          </>
        )}
      </p>
    </div>
  );
};

export default LoginPage;
