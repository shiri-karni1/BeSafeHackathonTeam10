import styles from './ChatHeader.module.css';
import profileIcon from '../../assets/profile-girl-icon.svg';
import participantsIcon from '../../assets/people.svg';
import PropTypes from 'prop-types';


const ChatHeader = ({ chat }) => {
  if (!chat) {
    return null;
  }

  // Static data for fields not in database
  const staticData = {
    category: 'בריאות האישה',
    participantsCount: 2
  };

  return (
    <div className={styles.chatHeader}>
      <div className={styles.headerTitleAndProfile}>
        <div className = {styles.profileContainer}>
          <img src={profileIcon} alt="User Avatar" className={styles.avatar} />
          <p className={styles.username}>{chat.username}</p>
        </div>        
        <h3 className={styles.chatTitle}>{chat.title}</h3>
      </div>
        <div className={styles.subtitle}>
          <p>{chat.content}</p>
        </div>
        <div className={styles.participantsAndTopic}>
          <div className={styles.participants}>
            <img src={participantsIcon} alt="Participants Icon" className={styles.participantsIcon} />
            <p> {staticData.participantsCount} </p>
            <p>משתתפות </p>
          </div>
          <div className={styles.category}>
            <p>{staticData.category}</p>
          </div>
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
