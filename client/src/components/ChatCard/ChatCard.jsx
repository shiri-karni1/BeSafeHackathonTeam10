import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Style from './ChatCard.module.css';
import PropTypes from 'prop-types';
import api from '../../services/axios.js';

export default function ChatCard({ chatId }) {
    const [chat, setChat] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchChat = async () => {
            try {
                const response = await api.get(`/chats/${chatId}`);
                setChat(response.data);
            } catch (err) {
                console.error('Error fetching chat:', err);
                setError('שגיאה בטעינת השאלה');
            }
        };

        if (chatId) {
            fetchChat();
        }
    }, [chatId]);

    const handleClick = () => {
        navigate(`/chat/${chatId}`);
    };

    if (error) return <div>{error}</div>;
    if (!chat) return null;

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString().slice(-2);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${day}.${month}.${year} ${hours}:${minutes}`;
    };

    return (
        <div onClick={handleClick} className={Style.chatCard}>
            <h4>{chat.title}</h4>
            <p className={Style.content}>{chat.content}</p>
            <div className={Style.chatInfo}>
                <p>{formatDate(chat.createdAt)}</p>
                <p>{chat.username}</p>
            </div>
        </div>
    );
}

ChatCard.propTypes = {
    chatId: PropTypes.string.isRequired
};

export { ChatCard };
