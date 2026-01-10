import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import styles from './Logout.module.css';

export default function Logout() {
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <button className={styles.logoutButton} onClick={handleLogout}>
            התנתקי
        </button>
    );
}
