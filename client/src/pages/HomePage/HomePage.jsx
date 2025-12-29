import styles from './Home.module.css';
import logo from '../../assets/logo.png';
import {ChatCard} from '../../components/ChatCard/ChatCard.jsx';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import Logout from '../../components/Logout/Logout.jsx';

const Home = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const fetchChats = async () => {
      try {
        setLoading(true);
        const response = await api.get('/chats');
        const userData = JSON.parse(currentUser);
        // Filter out chats created by current user
        const filteredChats = response.data.filter(chat => chat.username !== userData.username);
        setChats(filteredChats);
      } catch (err) {
        console.error('Error fetching chats:', err);
        setError('שגיאה בטעינת השאלות');
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [navigate]);

  return (
    <div className={styles.home}>
      <div className={styles.header}>
        <Logout />
        <a className={styles.logo} href="/"><img src={logo} alt="App Logo" className={styles.logo} /></a>
      </div>
      <h2> אולי את תדעי לייעץ כאן? </h2>
      
      {loading && <div>טוען...</div>}
      {error && <div>{error}</div>}
      
      <div className={styles.chatsContainer}>
        {chats.map((chat) => (
          <ChatCard key={chat._id} chatId={chat._id} />
        ))}
      </div>
      
      <button 
        className={styles.addButton}
        onClick={() => navigate('/add-new-chat')}
      >
        +
      </button>
    </div>
  );
};

export default Home;
