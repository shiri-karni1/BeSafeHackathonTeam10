import { Link } from 'react-router-dom';
import styles from './navBar.module.css';
import homeIcon from '../../assets/home-icon.svg';
import profileIcon from '../../assets/profile-girl-icon.svg';
import plusIcon from '../../assets/plus-icon.svg';

export default function NavBar() {
  return (
    <nav className={styles.nav}>
      <Link to="/">
        <img className={styles.navImg} src={homeIcon} alt="home" />
      </Link>
      <Link to="/profile">
        <img className={styles.navImg} src={profileIcon} alt="profile" />
      </Link>
    </nav>
  );
}