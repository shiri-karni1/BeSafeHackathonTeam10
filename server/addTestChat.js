import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Chat from './models/Chat.js';

dotenv.config();

const addTestChat = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const testChat = await Chat.create({
      title: 'התייעצות לגבי גלולות',
      content: 'היי בנות, רציתי להתייעץ אם להתחיל לקחת גלולות, מה דעתכן? בת 16',
      username: 'The Queennnn',
      messages: []
    });

    console.log('Test chat created successfully!');
    console.log('Chat ID:', testChat._id);
    console.log('You can access it at: http://localhost:5173/chat/' + testChat._id);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

addTestChat();
