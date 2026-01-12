import { useState, useEffect, useRef } from "react";
import socketService from "../SocketFactory/SocketFactory";
import PropTypes from "prop-types";
import SendIcon from "@mui/icons-material/Send";
import api from "../../services/axios.js";

// ===== Date/Time Formatting =====
const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
};

const formatTime = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
};

// ===== Message Helpers =====

// ===== Message Helpers =====

// Builds a consistent message for BLOCK responses
const buildPreciseReason = (obj) => {
  if (!obj) {
    return `ההודעה נחסמה\nסיבה: לא התקבלה סיבה מהשרת\nהצעת ניסוח:`;
  }
  if (typeof obj === "string") {
    return `ההודעה נחסמה\nסיבה: ${obj}\nהצעת ניסוח:`;
  }

  const reason = obj.reason || obj.message || "לא התקבלה סיבה מהשרת";
  const suggestion = obj.suggestedResponse || "";

  return `ההודעה נחסמה\nסיבה: ${reason}\nהצעת ניסוח: ${suggestion}`;
};

// Normalizes reference payload shape (just pass through, structure is already correct)
const normalizeReference = (reference) => {
  return reference || null;
};

// Determines message severity for styling
const getMsgSeverity = (msg) => {
  const severity = msg?.reference ? "reference" : "allow";
  console.log("[FRONTEND] Message severity:", {
    text: msg.text?.substring(0, 30),
    hasReference: !!msg.reference,
    severity
  });
  return severity;
};

// ===== Main Component =====

const ChatBoard = ({ roomId, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);

  const [toast, setToast] = useState(null);

  const socket = socketService.getSocket();

  useEffect(() => {
    if (!roomId) return;

    const fetchHistory = async () => {
      try {
        const response = await api.get(`/chats/${roomId}`);
        const data = response.data;

        const msgs = data?.messages || [];
        const history = msgs.map((msg) => ({
          ...msg,
          reference: normalizeReference(msg.reference),
          isMine: (msg.sender || msg.username) === currentUser?.name,
        }));

        setMessages(history);
      } catch (error) {
        console.error("Failed to load history from DB:", error);
        setToast({ type: "block", text: "🔴 נכשל בטעינת היסטוריית הודעות" });
      }
    };

    fetchHistory();
    socket.emit("join_room", roomId);
  }, [roomId, currentUser, socket]);

  useEffect(() => {
    const handleReceiveMessage = (data) => {
      console.log("[FRONTEND] Received socket message:", {
        text: data.text?.substring(0, 30),
        hasReference: !!data.reference,
        reference: data.reference
      });
      setMessages((prev) => {
        // De-dupe by _id to avoid duplicates between REST + socket delivery
        if (data?._id && prev.some((m) => m._id === data._id)) return prev;

        return [
          ...prev,
          {
            ...data,
            reference: normalizeReference(data.reference),
            isMine: (data.sender || data.username) === currentUser?.name,
          },
        ];
      });
    };

    socket.on("receive_message", handleReceiveMessage);
    return () => socket.off("receive_message", handleReceiveMessage);
  }, [socket, currentUser]);

  useEffect(() => {
    // Auto-scroll to latest message
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    const textToSend = inputValue.trim();
    if (!textToSend) return;
    setInputValue("");

    try {
      const res = await api.post(`/chats/${roomId}/messages`, {
        text: textToSend,
        username: currentUser?.name || "Guest",
      });

      const body = res.data;
      console.log("save message status:", res.status, body);

      // 🔴 חסימה: פורמט קבוע
      if (body?.isSafe === false || body?.moderation?.status === "BLOCK" || body?.blocked) {
        setToast({ type: "block", text: `🔴 ${buildPreciseReason(body)}` });
        return;
      }

      // Show reference toast (does not block sending)
      const reference = normalizeReference(body?.reference);
      if (reference) {
        const refText = reference.additionalInfo || "מידע נוסף צורף להודעה";
        setToast({ type: "info", text: `ℹ️ ${refText}` });
      }

      // Optimistic append if socket hasn't delivered it yet
      if (body?._id) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === body._id)) return prev;
          return [
            ...prev,
            {
              ...body,
              reference: normalizeReference(body.reference),
              isMine: true,
            },
          ];
        });
      }

    } catch (err) {
      console.error("save message network error:", err);
      setToast({ type: "block", text: "🔴 בעיית רשת — ההודעה לא נשמרה" });
    }
  };

  // Clicking a reference message opens the "details" as a toast
  const openDetails = (msg) => {
    if (!msg?.reference) return;

    console.log("[FRONTEND] Opening details for reference:", msg.reference);

    const ref = msg.reference;
    const severity = getMsgSeverity(msg); // Get the same severity as the message bubble
    const detailsText =
      `ℹ️ פרטי התראה\n` +
      `הודעה: ${msg.text}\n\n` +
      (ref.category ? `קטגוריה: ${ref.category}\n` : "") +
      (ref.additionalInfo ? `סיבה: ${ref.additionalInfo}` : "");

    console.log("[FRONTEND] Details text to show:", detailsText);
    setToast({ type: severity, text: detailsText });
  };


  return (
    <div className="chat-board">
      <div className="messages-display">
        {messages.map((msg, index) => {
          const severity = getMsgSeverity(msg);
          const msgDate = formatDate(msg.createdAt);
          const prevMsgDate = index === 0 ? null : formatDate(messages[index - 1]?.createdAt);
          const showDate = msgDate !== prevMsgDate;
          return (
            <>
              {showDate && (
                <div key={`date-${msgDate}-${index}`} className="chat-date-separator">
                  {msgDate}
                </div>
              )}
              <div
                key={msg._id || msg.id || index}
                className={`bubble ${msg.isMine ? "mine" : "theirs"} ${severity} ${msg.reference ? "clickable" : ""}`}
                onClick={() => openDetails(msg)}
                title={msg.reference ? "לחצי כדי לראות מידע נוסף" : ""}
                role={msg.reference ? "button" : undefined}
                tabIndex={msg.reference ? 0 : undefined}
                onKeyDown={(e) => {
                  if (!msg.reference) return;
                  if (e.key === "Enter" || e.key === " ") openDetails(msg);
                }}
              >
                <div className="msg-row msg-text-row">
                  {msg.reference && (
                    <div className="reference-banner">
                      ℹ️{" "}
                      {msg.reference?.additionalInfo ||
                        "מידע נוסף ממקורות מהימנים"}
                      <span className="reference-hint"> (לחצי לפירוט)</span>
                    </div>
                  )}
                  <div className="msg-text">{msg.text}</div>
                </div>

                <div className="msg-separator"></div>
                <div className="msg-row msg-bottom-row">
                  <span className="msg-time">{formatTime(msg.createdAt)}</span>
                  <span className="msg-sender">{msg.sender || msg.username}</span>
                </div>
              </div>
            </>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {toast && (
        <div className={`toast toast-${toast.type}`} role="alert" aria-live="polite">
          <pre className="toast-text">{toast.text}</pre>
          <button
            className="toast-close"
            onClick={() => setToast(null)}
            aria-label="סגור"
          >
            ✕
          </button>
        </div>
      )}

      <div className="input-container">
        <div className="input-box">
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
