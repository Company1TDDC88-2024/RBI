import React, { useState } from 'react';
import { useSignUp } from "./Hooks/useSignUp";
import { useLogin } from "./Hooks/useLogin";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../AuthContext"; // Importera useAuth för att få tillgång till AuthContext

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [isSignUp, setIsSignUp] = useState<boolean>(false);

  const { signUp, error: signUpError, loading: signUpLoading, success } = useSignUp();
  const { login, error: loginError, loading: loginLoading } = useLogin();
  const navigate = useNavigate();
  const { checkLoginStatus } = useAuth(); // Hämta checkLoginStatus från AuthContext

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSignUp) {
      await signUp(firstName, lastName, email, password);
      if (success) {
        setIsSignUp(false); // Växla till inloggningsläge efter lyckad registrering
      }
    } else {
      const loginSuccess = await login(email, password); // Anropa inloggningsfunktionen
      if (loginSuccess) {
        await checkLoginStatus(); // Uppdatera den globala inloggningsstatusen efter lyckad inloggning
        navigate("/dashboard"); // Omdirigera till dashboard
      }
    }
  };

  return (
    <div className="login-page">
      <h2>{isSignUp ? 'Sign Up' : 'Login'}</h2>
      <form onSubmit={handleSubmit}>
        {(signUpError || loginError) && (
          <p style={{ color: 'red' }}>{signUpError?.message || loginError?.message}</p>
        )}
        {(signUpLoading || loginLoading) && <p>Loading...</p>}

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
                required
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
                required
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