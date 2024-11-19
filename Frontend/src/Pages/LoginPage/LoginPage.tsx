import React, { useState, useEffect } from 'react';
import { useSignUp } from "./Hooks/useSignUp";
import { useLogin } from "./Hooks/useLogin";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../AuthContext";
import styles from './LoginPage.module.css';

// Import the image
import logo from '../Images/axis_communications_logo.png';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
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
      await signUp(firstName, lastName, email, password, isAdmin);

      if (signUpError === "Account with this email already exists") {
        setEmailError(signUpError);
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
    if (success && !signUpError) {
      setSuccessMessage('An email has been sent to ' + email + '. Click on the link to verify your account');
      setIsSignUp(false);
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setIsAdmin(false);
    }
  }, [success, signUpError]);

  return (
    <div className={styles.container}>
      {/* Add the image above the login card */}
      <img src={logo} alt="Axis Communications Logo" className={styles.bannerImage} />
      <div className={styles.separator}></div> {/* Add this line */}

      <div className={styles.card}>
        <h2>{isSignUp ? 'Sign Up' : 'Login'}</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          {(signUpError || loginError) && (
            <p className={styles.errorText}>
              {signUpError ? String(signUpError) : loginError ? String(loginError) : null}
            </p>
          )}
          {(signUpLoading || loginLoading) && <p className={styles.loadingText}>Loading...</p>}
          {successMessage && <p className={styles.successText}>{successMessage}</p>}
          {emailError && <p className={styles.errorText}>{emailError}</p>}

          {isSignUp && (
            <>
              <div className={styles.inputGroup}>
                <label htmlFor="firstName">First Name:</label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter your first name"
                  required
                  className={styles.input}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="lastName">Last Name:</label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter your last name"
                  required
                  className={styles.input}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="isAdmin">Admin User:</label>
                <input
                  type="checkbox"
                  id="isAdmin"
                  checked={isAdmin}
                  onChange={(e) => setIsAdmin(e.target.checked)}
                  className={styles.checkbox}
                />
              </div>
            </>
          )}

          <div className={styles.inputGroup}>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className={styles.input}
            />
          </div>

          <button type="submit" className={styles.button}>{isSignUp ? 'Sign Up' : 'Login'}</button>
        </form>

        <p>
          {isSignUp ? (
            <>
              Already have an account?{' '}
              <span onClick={() => setIsSignUp(false)} className={styles.switchText}>
                Log in
              </span>
            </>
          ) : (
            <>
              Don’t have an account?{' '}
              <span onClick={() => setIsSignUp(true)} className={styles.switchText}>
                Sign up
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
