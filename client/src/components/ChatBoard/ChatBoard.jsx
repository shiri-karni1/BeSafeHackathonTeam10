import { useState, useEffect, useRef } from "react";
import socketService from "../SocketFactory/SocketFactory";
import PropTypes from "prop-types";
import SendIcon from "@mui/icons-material/Send";

const formatTime = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
};

// ✅ פורמט קבוע: 
// ההודעה נחסמה
// סיבה:
// הצעת ניסוח:
const buildPreciseReason = (obj) => {
  // תומך גם במקרים שהשרת שולח reason ישירות כמחרוזת
  if (!obj) {
    return `ההודעה נחסמה\nסיבה: לא התקבלה סיבה מהשרת\nהצעת ניסוח:`;
  }

  if (typeof obj === "string") {
    return `ההודעה נחסמה\nסיבה: ${obj}\nהצעת ניסוח:`;
  }

  const reason =
    obj.reason ||
    obj.message ||
    "לא התקבלה סיבה מהשרת";

  const suggestion =
    obj.feedback ||
    obj.suggestedFix ||
    "";

  return `ההודעה נחסמה\nסיבה: ${reason}\nהצעת ניסוח: ${suggestion}`;
};

const getMsgSeverity = (msg) => {
  // צהוב אם יש warning
  if (msg?.warning) return "warn";
  // ירוק אחרת
  return "allow";
};

const normalizeWarning = (warning) => {
  // תומך בכמה מבנים אפשריים:
  if (!warning) return null;
  if (warning.warning) return warning.warning;
  return warning;
};

const ChatBoard = ({ roomId, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);

  // toast: אדום לחסימה, צהוב לאזהרה, ירוק למידע
  const [toast, setToast] = useState(null); // { type: "block"|"warn"|"info", text }
  const [selectedMsg, setSelectedMsg] = useState(null); // message clicked -> modal

  const socket = socketService.getSocket();

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 7000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`http://localhost:8080/chats/${roomId}`);
        const data = await response.json();

        const msgs = data?.messages || [];
        const history = msgs.map((msg) => ({
          ...msg,
          isMine: (msg.sender || msg.username) === currentUser?.name,
        }));

        setMessages(history);
      } catch (error) {
        console.error("Failed to load history from DB:", error);
        setToast({ type: "block", text: "🔴 נכשל בטעינת היסטוריית הודעות" });
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
          { ...data, isMine: (data.sender || data.username) === currentUser?.name },
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
    if (!textToSend) return;

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

      // 🔴 חסימה: פורמט קבוע
      if (!res.ok || body?.isSafe === false || body?.moderation?.status === "BLOCK" || body?.blocked) {
        setToast({ type: "block", text: `🔴 ${buildPreciseReason(body)}` });
        return;
      }

      // 🟡 warning: אם תרצי שגם אזהרה תשתמש באותו פורמט — זה כבר קורה כאן
      const warning = normalizeWarning(body?.warning);
      if (warning) {
        setToast({ type: "warn", text: `🟡 ${buildPreciseReason(warning)}` });
      }

      // להוסיף מקומית אם עוד לא הגיע מהסוקט
      if (body?._id) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === body._id)) return prev;
          return [...prev, { ...body, isMine: true }];
        });
      }

      setInputValue("");
    } catch (err) {
      console.error("save message network error:", err);
      setToast({ type: "block", text: "🔴 בעיית רשת — ההודעה לא נשמרה" });
    }
  };

  const openDetails = (msg) => {
    if (!msg) return;
    // פותחים מודאל רק אם יש warning (אחרת זה סתם מציק)
    if (msg.warning) setSelectedMsg(msg);
  };

  const closeDetails = () => setSelectedMsg(null);

  return (
  <div className="chat-board">
    {/* Modal for warning details */}
    {selectedMsg && (
      <div className="modal-backdrop" onClick={closeDetails}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-title">🟡 פירוט אזהרה (AI)</div>

          <div className="modal-body">
            <div className="modal-row">
              <b>הודעה:</b> {selectedMsg.text}
            </div>

            <div className="modal-row">
              <b>פרטי אזהרה:</b>
              <pre className="modal-pre">
                {buildPreciseReason(normalizeWarning(selectedMsg.warning))}
              </pre>
            </div>
          </div>

          <div className="modal-actions">
            <button className="btn btn-primary" onClick={closeDetails}>
              סגור
            </button>
          </div>
        </div>
      </div>
    )}

    <div className="messages-display">
      {messages.map((msg, index) => {
        const severity = getMsgSeverity(msg);

        return (
          <div
            key={msg._id || msg.id || index}
            className={`bubble ${msg.isMine ? "mine" : "theirs"} ${severity} ${
              msg.warning ? "clickable" : ""
            }`}
            onClick={() => openDetails(msg)}
            title={msg.warning ? "לחצי כדי לראות פירוט אזהרה" : ""}
            role={msg.warning ? "button" : undefined}
            tabIndex={msg.warning ? 0 : undefined}
            onKeyDown={(e) => {
              if (!msg.warning) return;
              if (e.key === "Enter" || e.key === " ") openDetails(msg);
            }}
          >
            {!msg.isMine && (
              <div className="msg-sender">{msg.sender || msg.username}</div>
            )}

            {msg.warning && (
              <div className="warning-banner">
                🟡 {normalizeWarning(msg.warning)?.reason || "אזהרה: ייתכן שהתוכן לא מדויק / לא מבוסס"}
                <span className="warning-hint"> (לחצי לפירוט)</span>
              </div>
            )}

            <div className="msg-text">{msg.text}</div>
            <div className="msg-time">{formatTime(msg.createdAt)}</div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>

    {/* ✅ Toast — עכשיו מתחת להודעות ומעל תיבת הטקסט */}
    {toast && (
      <div className={`toast toast-${toast.type}`} role="alert" aria-live="polite">
        <pre className="toast-text">{toast.text}</pre>
        <button className="toast-close" onClick={() => setToast(null)} aria-label="סגור">
          ✕
        </button>
      </div>
    )}

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
        <SendIcon style={{ transform: "scaleX(-1)" }} />
      </button>
    </div>
  </div>
);
};

ChatBoard.propTypes = {
  roomId: PropTypes.string.isRequired,
  currentUser: PropTypes.shape({
    name: PropTypes.string,
  }),
};

export default ChatBoard;
