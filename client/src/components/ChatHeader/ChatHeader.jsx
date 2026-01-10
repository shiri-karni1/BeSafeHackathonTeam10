import styles from './ChatHeader.module.css';
import profileIcon from '../../assets/profile-girl-icon.svg';
import PropTypes from 'prop-types';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { useNavigate } from 'react-router-dom';

const ChatHeader = ({ chat }) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1); // Navigate to the previous page
  }

  if (!chat) {
    return null;
  }
  return (
    <div className={styles.chatHeader}>
      <div className={styles.headerTopRow}>
        <div className={styles.backButtonContainer}>
          <button className={styles.backButton} onClick={handleBackClick}><ChevronLeftIcon /></button>
        </div>
        <div className={styles.profileContainer}>
          <img src={profileIcon} alt="User Avatar" className={styles.avatar} />
          <span className={styles.username}>{chat.username}</span>
        </div>
      </div>
      <div className={styles.headerCenter}>
        <h3 className={styles.chatTitle}>{chat.title}</h3>
        <div className={styles.subtitle}>{chat.content}</div>
      </div>
    </div>
  );
};

ChatHeader.propTypes = {
  chat: PropTypes.shape({
    username: PropTypes.string,
    title: PropTypes.string,
    content: PropTypes.string
  })
};

export default ChatHeader;
