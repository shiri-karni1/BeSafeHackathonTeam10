import { Link, useLocation } from 'react-router-dom';
import styles from './navBar.module.css';
import homeIcon from '../../assets/home-icon.svg';
import profileIcon from '../../assets/profile-girl-icon.svg';
import plusIcon from '../../assets/plus-icon.svg';

export default function NavBar() {
  const location = useLocation();

  return (
    <div className={styles.navContainer}>
      <nav className={styles.nav}>
      <Link to="/profile" className={location.pathname === '/profile' ? styles.active : styles.nonactive}>
        <img className={styles.navImg} src={profileIcon} alt="profile" />
      </Link>
      <Link to="/create" className={location.pathname === '/create' ? styles.active : styles.nonactive}>
        <img className={styles.navImg} src={plusIcon} alt="create" />
      </Link>
      <Link to="/" className={location.pathname === '/' ? styles.active : styles.nonactive}>
        <img className={styles.navImg} src={homeIcon} alt="home" />
      </Link>
      
    </nav>
  </div>
  );
}