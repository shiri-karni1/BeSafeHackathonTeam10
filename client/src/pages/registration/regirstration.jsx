import logo from '../../assets/logo.png';
import styles from './registration.module.css';
import { useState } from 'react';
import api from '../../services/axios.js';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username.trim()) {
            setError('נא למלא את שדה שם המשתמש');
            return;
        }
        if (!password) {
            setError('נא למלא את שדה הסיסמה');
            return;
        }
        try {
            setError(null);
            // Call API to create new user
            await api.post('/users/signup', { 
                username: username.trim(), 
                password 
            });
            // Navigate to login page
            navigate('/login');
        } catch (err) {
            console.error('Error during signup:', err);
            setError(err.response?.data?.message || 'שגיאה בתהליך ההרשמה');
        }
    };

    return (
        <div className={styles.login}>
            <img src={logo} alt="App Logo" className={styles.logo} />
            <h2>יצירת משתמשת חדשה</h2>
            {error && <div className={styles.error}>{error}</div>}
            <form className={styles.loginForm} onSubmit={handleSubmit}>
                <input
                    className = {styles.loginInput}
                    type="text"
                    id="username"
                    name="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="שם משתמש"
                />
                <input
                    className = {styles.loginInput}
                    type="password"
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="סיסמא"
                />
                <button type="submit" className={styles.loginButton}>הרשמה</button>
            </form>
        </div>
    );
}

export default SignUp;