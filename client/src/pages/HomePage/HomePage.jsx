import styles from './Home.module.css';
import RandomDuck from '../../components/RandomDuck/RandomDuck.jsx';
import NavBar from '../../components/navBar/navBar.jsx';

const Home = () => {
  return (
    <div className={styles.home}>
      <NavBar />
      <RandomDuck />
    </div>
  );
};

export default Home;
