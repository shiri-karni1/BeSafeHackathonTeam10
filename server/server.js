const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const rubberDuckRoutes = require('./routes/rubberDucks'); // Import the routes

dotenv.config();

const app = express();

app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'images'))); // Serve static images

app.use(cors({
  origin: process.env.CLIENT_URL
}));

// Use the routes file for all `/ducks` routes
app.use('/ducks', rubberDuckRoutes);


// Start server
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
