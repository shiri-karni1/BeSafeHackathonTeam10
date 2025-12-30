import { useNavigate } from 'react-router-dom';
import styles from './Logout.module.css';

export default function Logout() {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Remove user from localStorage
        localStorage.removeItem('currentUser');
        // Navigate to login page
        navigate('/login');
    };

    return (
        <button className={styles.logoutButton} onClick={handleLogout}>
            התנתקי
        </button>
    );
}
