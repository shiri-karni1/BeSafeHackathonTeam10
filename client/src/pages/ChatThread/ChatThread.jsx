import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ChatHeader from "../../components/ChatHeader/ChatHeader.jsx";
import styles from "./ChatThread.module.css";
import api from '../../services/api.js';
import ChatBoard from '../../components/ChatBoard/ChatBoard.jsx';


export default function ChatThread() {
  const { chatId } = useParams();
  const [chat, setChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChat = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/chats/${chatId}`);
        setChat(response.data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching chat:', err);
      } finally {
        setLoading(false);
      }
    };

    if (chatId) {
      fetchChat();
    }
  }, [chatId]);

  if (loading) {
    return <div className={styles.chatThread}><p>Loading...</p></div>;
  }

  if (error) {
    return <div className={styles.chatThread}><p>Error: {error}</p></div>;
  }

  if (!chat) {
    return <div className={styles.chatThread}><p>Chat not found</p></div>;
  }

  return (
    <div className={styles.chatThread}>
        <ChatHeader chat={chat} />
        <ChatBoard chatId={chatId} />
    </div>
  );
}