import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from "./NewChat.module.css";
import logo from "../../assets/logo.png";
import api from '../../services/api.js';

export default function NewChat() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!title.trim()) {
            setError('נא למלא את שדה השאלה');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Get current user from localStorage
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            const username = currentUser?.username;
            if (!username) {
                setError('משתמש לא מחובר');
                setLoading(false);
                return;
            }

            // Create new chat
            const response = await api.post('/chats', {
                title: title.trim(),
                content: content.trim() || '',
                username: username
            });

            const newChat = response.data;
            
            // Navigate to the new chat
            navigate(`/chat/${newChat._id}`);
        } catch (err) {
            console.error('Error creating chat:', err);
            setError(err.response?.data?.message || 'שגיאה ביצירת השאלה');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={styles.newChat}>
            <a className={styles.logo} href="/"><img src={logo} alt="App Logo" className={styles.logo} /></a>
            <h2> שאלה חדשה</h2>
            {error && <div className={styles.error}>{error}</div>}
            <form className={styles.newChatForm} onSubmit={handleSubmit}>
                <label htmlFor="title">מה השאלה שלך?</label>
                <textarea 
                    id="title" 
                    name="title" 
                    rows="4" 
                    placeholder="כתבי כאן את שאלתך..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={loading}
                ></textarea>
                <label htmlFor="details">פרטים נוספים</label>
                <textarea 
                    id="details" 
                    name="details" 
                    rows="6" 
                    placeholder="פרטי כאן כל מידע שיאפשר למשתמשות לעזור לך"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    disabled={loading}
                ></textarea>

                <button 
                    type="submit" 
                    className={styles.submitButton}
                    disabled={loading}
                >
                    {loading ? 'שולח...' : 'שלחי שאלה'}
                </button>
            </form>
        </div>
    );
}