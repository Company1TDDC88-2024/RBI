import React, { useState, useEffect } from 'react';
import { useLogin } from "./Hooks/useLogin";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../AuthContext";
import styles from './LoginPage.module.css';
import { Spin } from 'antd';

// Import the image
import logo from '../Images/axis_communications_logo.png';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [emailError, setEmailError] = useState<string | null>(null);

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

    const loginSuccess = await login(email, password);
    if (loginSuccess) {
      await checkLoginStatus();
      navigate("/dashboard");
    }
  };

  return (
    <div className={styles.container}>
      {/* Add the image above the login card */}
      <img src={logo} alt="Axis Communications Logo" className={styles.bannerImage} />
      <div className={styles.separator}></div>

      <div className={styles.card}>
        <h2>Login</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          {loginError && <p className={styles.errorText}>{String(loginError)}</p>}
          {loginLoading && <Spin tip="Loading..." />}
          {emailError && <p className={styles.errorText}>{emailError}</p>}

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

          <button type="submit" className={styles.button}>Login</button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
