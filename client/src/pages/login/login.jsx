import logo from '../../assets/logo.png';
import styles from './login.module.css';
import { useState } from 'react';
import api from '../../services/api.js';
import { useNavigate } from 'react-router-dom';

const Login = () => {
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
            // Call API to login
            const response = await api.post('/users/login', { 
                username: username.trim(), 
                password 
            });
            const user = response.data;
            // Store user in localStorage
            localStorage.setItem('currentUser', JSON.stringify(user));
            // Navigate to home page
            navigate('/');
        } catch (err) {
            console.error('Error during login:', err);
            setError(err.response?.data?.message || 'שגיאה בתהליך ההתחברות');
        }
    };

    return (
        <div className={styles.login}>
            <img src={logo} alt="App Logo" className={styles.logo} />
            <h2>התחברות</h2>
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
                <button type="submit" className={styles.loginButton}>התחברי</button>
                <button type="button" className={styles.registerButton} onClick={() => navigate('/register')}>להרשמה</button>
            </form>
        </div>
    );
}

export default Login;