import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  text: { type: String, required: true },
  username: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  isSafe: { type: Boolean, default: true },
  feedback: String,
  warning: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
});

const chatSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  username: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  messages: [messageSchema]
});

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;