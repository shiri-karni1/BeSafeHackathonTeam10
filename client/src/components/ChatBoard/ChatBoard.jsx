import { useState, useEffect, useRef } from 'react';
import socketService from '../SocketFactory/SocketFactory';
import PropTypes from 'prop-types';
import SendIcon from '@mui/icons-material/Send';

const formatTime = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
};

const ChatBoard = ({ roomId, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);

  const socket = socketService.getSocket();

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
    socket.emit("join_room", roomId);
  }, [roomId, currentUser, socket]);

  useEffect(() => {
    const handleReceiveMessage = (data) => {
      setMessages((prev) => {
        if (data?._id && prev.some((m) => m._id === data._id)) return prev;

        return [
          ...prev,
          { ...data, isMine: (data.sender || data.username) === currentUser?.name }
        ];
      });
    };

    socket.on("receive_message", handleReceiveMessage);
    return () => socket.off("receive_message", handleReceiveMessage);
  }, [socket, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    const textToSend = inputValue.trim();
    if (textToSend === "") return;

    try {
      const res = await fetch(`http://localhost:8080/chats/${roomId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textToSend,
          username: currentUser?.name || "Guest",
        }),
      });

      const body = await res.json().catch(() => ({}));
      console.log("save message status:", res.status, body);

      if (!res.ok || body?.isSafe === false || body?.blocked) {
        alert(body?.message || body?.reason || "ההודעה נחסמה או לא נשמרה");
        return;
      }

      setMessages((prev) => {
         if (body?._id && prev.some((m) => m._id === body._id)) return prev;
         return [...prev, { ...body, isMine: true }];
    });


      setInputValue("");
    } catch (err) {
      console.error("save message network error:", err);
      alert("בעיה ברשת — ההודעה לא נשמרה");
    }
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
            <div className="msg-time">{formatTime(msg.createdAt)}</div>
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
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
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
