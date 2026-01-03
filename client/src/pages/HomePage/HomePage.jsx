import styles from './Home.module.css';
import logo from '../../assets/logo.png';
import { ChatCard } from '../../components/ChatCard/ChatCard.jsx';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import Logout from '../../components/Logout/Logout.jsx';

const Home = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const chatsPerPage = 6;
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
        // Sort by createdAt - newest first
        const sortedChats = filteredChats.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setChats(sortedChats);
      } catch (err) {
        console.error('Error fetching chats:', err);
        setError('שגיאה בטעינת השאלות');
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [navigate]);

  // Pagination calculations
  const indexOfLastChat = currentPage * chatsPerPage;
  const indexOfFirstChat = indexOfLastChat - chatsPerPage;
  const currentChats = chats.slice(indexOfFirstChat, indexOfLastChat);
  const totalPages = Math.ceil(chats.length / chatsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
        {currentChats.map((chat) => (
          <ChatCard key={chat._id} chatId={chat._id} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={styles.paginationButton}
          >
            {'>'}
          </button>

          <span className={styles.pageInfo}>
            עמוד {currentPage} מתוך {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={styles.paginationButton}
          >
            {'<'}
          </button>
        </div>
      )}

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
