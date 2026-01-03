import { useState, useEffect, useRef } from 'react';
import socketService from '../SocketFactory/SocketFactory';
import PropTypes from 'prop-types';
import SendIcon from '@mui/icons-material/Send';

const ChatBoard = ({ roomId, currentUser }) => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const messagesEndRef = useRef(null); // Reference for auto-scrolling

    const socket = socketService.getSocket();

    const getCurrentTime = () => {
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Join room and fetch existing message history from MongoDB
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await fetch(`http://localhost:8080/chats/${roomId}`);
                const data = await response.json();

                const msgs = data?.messages || [];
                const history = msgs.map(msg => ({
                    ...msg,
                    isMine: (msg.sender || msg.username) === currentUser?.name
                }));

                setMessages(history);
            } catch (error) {
                console.error("Failed to load history from DB:", error);
            }
        };

        if (!roomId) return;

        fetchHistory();
        // שימוש בסוקט המשותף להצטרפות לחדר
        socket.emit("join_room", roomId);
    }, [roomId, currentUser, socket]);

    // Listen for incoming real-time messages
    useEffect(() => {
        const handleReceiveMessage = (data) => {
            if (data?.senderId === socket.id) return;

            setMessages((prev) => [
                ...prev,
                { ...data, isMine: (data.sender || data.username) === currentUser?.name }
            ]);
        };

        socket.on("receive_message", handleReceiveMessage);

        // Cleanup socket listener on unmount
        return () => socket.off("receive_message", handleReceiveMessage);
    }, [socket, currentUser]);

    // Keep the chat scrolled to the bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = () => {
        const textToSend = inputValue.trim();
        if (textToSend === "") return;

        const messageData = {
            id: Date.now(), // Temporary key for React rendering
            room: roomId,
            sender: currentUser?.name || "Guest",
            senderId: socket.id,
            text: textToSend,
            time: getCurrentTime(),
        };

        // Broadcast message to server (Server handles MongoDB persistence)
        socket.emit("send_message", messageData);

        fetch(`http://localhost:8080/chats/${roomId}/messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                text: textToSend,
                username: currentUser?.name || "Guest"
            }),
        }).catch(() => {});

        // Optimistic UI update for immediate feedback
        setMessages((prev) => [...prev, { ...messageData, isMine: true }]);

        setInputValue("");
    };

    return (
        <div className="chat-board">
            <div className="messages-display">
                {messages.map((msg, index) => (
                    <div
                        key={msg._id || msg.id || index}
                        className={`bubble ${msg.isMine ? 'mine' : 'theirs'}`}
                    >
                        {!msg.isMine && <div className="msg-sender">{msg.sender || msg.username}</div>}
                        <div className="msg-text">{msg.text}</div>
                        <div className="msg-time">{msg.time}</div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="input-container">
                <textarea
                    placeholder="אני חושבת ש..."
                    value={inputValue}
                    rows="2"
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button onClick={handleSendMessage} className="send-btn">
                    <SendIcon style={{ transform: 'scaleX(-1)' }} />
                </button>
            </div>
        </div>
    );
};

ChatBoard.propTypes = {
    roomId: PropTypes.string.isRequired,
    currentUser: PropTypes.shape({
        name: PropTypes.string
    })
};

export default ChatBoard;
