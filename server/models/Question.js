import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  text: { type: String, required: true },
  sender: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  isSafe: { type: Boolean, default: true },
  feedback: String
});

const questionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  username: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  messages: [messageSchema]
});

const Question = mongoose.model('Question', questionSchema);

export default Question;