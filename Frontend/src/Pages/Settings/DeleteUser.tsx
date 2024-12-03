import React, { useState } from 'react';
import { useDeleteUser } from '../LoginPage/Hooks/useDeleteUser';
import styles from './CreateUser.module.css';
import { Spin } from 'antd';

const DeleteUser: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { deleteUser, error: deleteUserError, loading: deleteUserLoading, success } = useDeleteUser();

  const validateEmail = (email: string): boolean => {
    return email.endsWith('@student.liu.se') || email.endsWith('@axis.com') || email.endsWith('@liu.se');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    
    setEmailError(null);
    setSuccessMessage(null);

    if (!validateEmail(email)) {
      setEmailError('Email must end with @student.liu.se, @axis.com, or @liu.se');
      return;
    }

    await deleteUser(email);

    
    if (deleteUserError) {
      setSuccessMessage(null); 
      if (typeof deleteUserError === 'string' && deleteUserError === "Account not found") {
        setEmailError(deleteUserError);
      } else {
        setEmailError('An unexpected error occurred.');
      }
    } else if (success) {
      setEmailError(null); 
      setSuccessMessage(`Account with email ${email} has been deleted successfully`);
      setEmail('');
    }
  };

  React.useEffect(() => {
    
    if (success) {
      setEmailError(null); 
      setSuccessMessage(`Account with email ${email} has been deleted successfully`);
    }

    if (deleteUserError) {
      setSuccessMessage(null); 
      setEmailError(deleteUserError.toString());
    }
  }, [success, deleteUserError]);

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        {emailError && <p className={styles.errorText}>{emailError}</p>}
        {successMessage && <p className={styles.successText}>{successMessage}</p>}
        {deleteUserLoading && <Spin tip="Loading..." />}

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

        <button type="submit" className={styles.deleteButton}>Delete Account</button>
      </form>
    </div>
  );
};

export default DeleteUser;