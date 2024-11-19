import React, { useState } from 'react';
import { useDeleteUser } from '../LoginPage/Hooks/useDeleteUser';
import styles from './CreateUser.module.css';

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

    if (!validateEmail(email)) {
      setEmailError('Email must end with @student.liu.se, @axis.com, or @liu.se');
      return;
    } else {
      setEmailError(null);
    }

    await deleteUser(email);

    if (typeof deleteUserError === 'string' && deleteUserError === "Account not found") {
        setEmailError(deleteUserError);
      }
  };

  React.useEffect(() => {
    if (success && !deleteUserError) {
      setSuccessMessage(`Account with email ${email} has been deleted successfully`);
      setEmail('');
    }
  }, [success, deleteUserError]);

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        {emailError && <p className={styles.errorText}>{emailError}</p>}
        {deleteUserError && <p className={styles.errorText}>{deleteUserError.toString()}</p>}
        {deleteUserLoading && <p className={styles.loadingText}>Loading...</p>}
        {successMessage && <p className={styles.successText}>{successMessage}</p>}

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
