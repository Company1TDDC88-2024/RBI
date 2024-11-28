// CreateUser.tsx

import React, { useState } from 'react';
import { useSignUp } from '../LoginPage/Hooks/useSignUp';
import styles from './CreateUser.module.css';
import { Spin } from 'antd';

const CreateUser: React.FC = () => {
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' | null }>({
    text: '',
    type: null,
  });
  
  const { signUp, error: signUpError, loading: signUpLoading, success } = useSignUp();

  const validateEmail = (email: string): boolean => {
    return email.endsWith('@student.liu.se') || email.endsWith('@axis.com') || email.endsWith('@liu.se');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    // Rensa tidigare meddelande
    setMessage({ text: '', type: null });
  
    if (!validateEmail(email)) {
      setMessage({ text: 'Email must end with @student.liu.se, @axis.com, or @liu.se', type: 'error' });
      return;
    }
  
    await signUp(firstName, lastName, email, password, isAdmin);
  
    if (signUpError) {
      setMessage({ text: signUpError, type: 'error' });
    } else if (success) {
      setMessage({
        text: `An email has been sent to ${email}. Click on the link to verify your account.`,
        type: 'success',
      });
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setIsAdmin(false);
    }
  };

  React.useEffect(() => {
    if (success && !signUpError) {
      setMessage({
        text: `An email has been sent to ${email}. Click on the link to verify your account.`,
        type: 'success',
      });
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setIsAdmin(false);
    } else if (signUpError) {
      setMessage({ text: signUpError, type: 'error' });
    }
  }, [success, signUpError]);
  

  // React.useEffect(() => {
  //   if (message.type) {
  //     const timer = setTimeout(() => {
  //       setMessage({ text: '', type: null }); // Rensa meddelandet efter 5 sekunder
  //     }, 5000); // Timeout på 5000 ms (5 sekunder)
  //     return () => clearTimeout(timer); // Rensa timeout vid unmount eller uppdatering
  //   }
  // }, [message]);
  
  

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        {message.type && (
          <p className={message.type === 'error' ? styles.errorText : styles.successText}>{message.text}</p>
        )}
        {signUpLoading && <Spin tip="Loading..." />}

        <div className={styles.inputGroup}>
          <label htmlFor="firstName">First Name:</label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            pattern="^[A-Za-zÅÄÖåäö\s-]+$"
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
            pattern="^[A-Za-zÅÄÖåäö\s-]+$"
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
