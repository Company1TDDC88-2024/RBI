import React, { useState, useEffect } from 'react';
import { useSignUp } from "./Hooks/useSignUp";
import { useLogin } from "./Hooks/useLogin";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../AuthContext";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { signUp, error: signUpError, loading: signUpLoading, success } = useSignUp();
  const { login, error: loginError, loading: loginLoading } = useLogin();
  const navigate = useNavigate();
  const { checkLoginStatus } = useAuth();

  const validateEmail = (email: string): boolean => {
    return email.endsWith('@student.liu.se') || email.endsWith('@axis.com') || email.endsWith('@liu.se');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateEmail(email)) {
        setEmailError('Email must end with @student.liu.se, @axis.com, or @liu.se');
        return;
    } else {
        setEmailError(null);
    }

    if (isSignUp) {
        await signUp(firstName, lastName, email, password);

        // Kontrollera om signUpError anger att kontot redan finns
        if (signUpError === "Account with this email already exists") {
            setEmailError(signUpError);  // Visa backend-felmeddelandet om kontot finns
            return;
        }
    } else {
        const loginSuccess = await login(email, password);
        if (loginSuccess) {
            await checkLoginStatus();
            navigate("/dashboard");
        }
    }
  };

  useEffect(() => {
    if (success && !signUpError) {  // Kontrollera att inga felmeddelanden finns
        setSuccessMessage('Account created successfully!');
        setIsSignUp(false);
        setFirstName('');
        setLastName('');
        setEmail('');
        setPassword('');
    }
  }, [success, signUpError]);

  return (
    <div className="login-page">
      <h2>{isSignUp ? 'Sign Up' : 'Login'}</h2>
      <form onSubmit={handleSubmit}>
        {/* Visa backend-felmeddelandet i röd text om ett fel finns */}
        {(signUpError || loginError) && (
          <p style={{ color: 'red' }}>
            {signUpError
              ? typeof signUpError === 'string'
                ? signUpError
                : (signUpError as Error).message
              : loginError
              ? typeof loginError === 'string'
                ? loginError
                : (loginError as Error).message
              : null}
          </p>
        )}
        {(signUpLoading || loginLoading) && <p>Loading...</p>}

        {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
        {emailError && <p style={{ color: 'red' }}>{emailError}</p>} {/* Visa rött felmeddelande */}

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
