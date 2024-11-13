// CreateUser.tsx

import React, { useState } from 'react';
import { useSignUp } from '../LoginPage/Hooks/useSignUp';
import styles from './CreateUser.module.css';

const CreateUser: React.FC = () => {
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { signUp, error: signUpError, loading: signUpLoading, success } = useSignUp();

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

    await signUp(firstName, lastName, email, password, isAdmin);

    if (signUpError === "Account with this email already exists") {
      setEmailError(signUpError);
    }
  };

  React.useEffect(() => {
    if (success && !signUpError) {
      setSuccessMessage(`An email has been sent to ${email}. Click on the link to verify your account`);
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setIsAdmin(false);
    }
  }, [success, signUpError]);

  return (
    <div className={styles.container}>
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        {emailError && <p className={styles.errorText}>{emailError}</p>}
        {signUpError && <p className={styles.errorText}>{signUpError}</p>}
        {signUpLoading && <p className={styles.loadingText}>Loading...</p>}
        {successMessage && <p className={styles.successText}>{successMessage}</p>}

        <div className={styles.inputGroup}>
          <label htmlFor="firstName">First Name:</label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="lastName">Last Name:</label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="isAdmin">Admin User:</label>
          <input
            type="checkbox"
            id="isAdmin"
            checked={isAdmin}
            onChange={(e) => setIsAdmin(e.target.checked)}
          />
        </div>

        <button type="submit" className={styles.button}>Create Account</button>
      </form>
    </div>
  );
};

export default CreateUser;
