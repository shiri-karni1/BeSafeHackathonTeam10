# QueenB X AppsFlyer - BeSafe Hackathon 2026

## Project Presentation
[View Project Presentation](https://www.canva.com/design/DAG9oEP4uno/sfSXt1wwMUXi6fwrzUMg0Q/edit)

## About BeSafe

BeSafe is a full-stack MERN application designed to provide a safe and supportive chat environment for teenagers. The platform combines real-time chat functionality with AI-powered safety features to ensure users can communicate freely while being protected from harmful content.

### Key Features

- **Real-time Chat**: Socket.io-based chat system enabling instant messaging
- **AI Safety Agent**: Intelligent content monitoring and verification system
- **User Authentication**: Secure registration and login system
- **Onboarding Flow**: Guided introduction for new users
- **Trusted Sources**: Curated information on topics relevant to teens including:
  - Relationships and friendships
  - Sexual health and consent
  - Body image and nutrition
  - Peer pressure and social life
  - Education and hobbies
  - Mental health and well-being

### Technology Stack

- **Frontend**: React with Vite, Socket.io-client
- **Backend**: Node.js, Express, Socket.io
- **Database**: MongoDB
- **AI Integration**: Safety verification and content moderation agents
- **Authentication**: JWT-based authentication

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/en) 
  - Version 20.x or higher required (latest LTS recommended)
- `npm` (will be typically installed automatically when you install Node.js above)
  -  Version 10.x or higher required (get the latest by running `npm install -g npm@latest --no-optional`)

### Clone the Repository
To get started with this project, you need to clone the repository to your local machine. Follow these steps:
1. Create a project from this repository by clicking on `Use this template` -> `Create a new repository` (more info [here](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template)) - only ONCE per project
1. Clone the new Repository: https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository

### Server Setup
1. Navigate to the server directory: `cd server`
1. Install server dependencies: `npm install`

### Client Setup
1. Navigate to the client directory: `cd ../client`
1. Install client dependencies: `npm install`

## Configuration

### Environment Variables
Environment variables are used to configure your application without hardcoding sensitive information into your code. For this project, you need to set up the following environment variables in `.env` files located both in the `server` directory and `client` directory.

#### Configure the Backend (server)

Make a copy of the `.env.example` file under the `server` folder and name it `.env`. This file contains the following environment variables (you don't need to touch them at this point):
   - `CLIENT_URL` - this should match the URL of the client, which is what you'll see at the address bar of your browser after running your client (via `npm start`).
   - `PORT` - This variable defines the port on which your Express server will run. By default, this is set to `8080`, but you can change it to any available port number.

#### Configure the Frontend (client)

Make a copy of the `.env.example` file under the `client` folder and name it `.env`. 
This file contains the following environment variable (you don't need to touch them at this point):

* `VITE_SERVER_API_URL`: This variable contains the URL of your backend API. It tells your client where to send requests to interact with the server. By default, this should be set to http://localhost:8080/, but you should change it to match your server's actual URL if different (where 8080 is the `PORT` you defined in the server `.env` file above).

## Usage

This section explains how to use the application once it’s set up and configured. Follow these steps to interact with both the client and server components of the application.

### Start the Server
1. Open a terminal in the root folder of the cloned repository, and navigate to the `server` directory: `cd server`
1. Start the Express server in development mode: `npm run dev`
   - By default, the server will run on `http://localhost:8080` (see configuration section above)

### Run the Client
1. Open a **new** terminal in the root folder of the cloned repository, and navigate to the `client` directory: `cd client`

2. Run the Frontend Client: `npm run dev`
   - A new browser window with the client application should open (if you close the tab, you can return to it by navigating to http://localhost:3000/ by default)

### Test the Application

   - Register a new account or login with existing credentials
   - Complete the onboarding process
   - Start a new chat conversation
   - Test the real-time messaging functionality
   - Observe the AI safety features in action
   - You may also use an API client (like [Postman](https://www.postman.com/)) to directly test your API endpoints

**Please report any issues or provide feedback for further improvements!**

### Stopping the Servers

- **Stop the Express Server**: In the terminal where the server is running, press `Ctrl + C` to stop the server.
- **Stop the React Client**: In the terminal where the client is running, press `Ctrl + C` to stop the client.

### Troubleshooting

Ensure backend and frontend configurations (`.env` files) are correct.

- **Server Issues**:
  - Ensure that the React development server is running and that you have no conflicting applications using port 3000.
  - Check the terminal for error messages 

- **Client Issues**:
  - Check the browser dev tools console for errors if the client is not displaying correctly (recommended: https://reactjs.org/link/react-devtools).
  - Check the browser dev tools network logs for failed requests

## Project Structure

### Client Directory (`client/`)
Contains the React (Vite) frontend application.
- `package.jsStatic assets that do not need to be processed by Vite's build pipeline.
- `src/`: Contains the source code for the React application.
   - `assets/`: Assets that are part of the source code and need to be processed by Vite's build pipeline.
   - `components/`: Reusable UI components including:
     - `ChatBoard/`: Main chat interface component
     - `ChatCard/`: Individual chat message cards
     - `ChatHeader/`: Chat header with navigation
     - `navBar/`: Main navigation bar
     - `ProtectedRoute/`: Route protection for authenticated users
     - `SocketFactory/`: Socket.io connection management
   - `context/`: React context providers for state management (AuthContext, DuckContext)
   - `pages/`: Page components representing different routes:
     - `HomePage/`: Landing page
     - `login/` & `registration/`: Authentication pages
     - `ChatThread/`: Individual chat conversations
     - `NewChat/`: Create new chat interface
     - `OnBoarding/`: User onboarding flow
   - `services/`: Services for API calls and business logic (axios configuration)
   - `styles/`: CSS and styling files for the application.
   - `App.jsx`: The main React component that sets up routing and renders the application.
   - `index.jsx`: The entry point for the React application, responsible for rendering the App component into the DOM.
      
### Server Directory (`server/`)
Contains the Node.js / Express backend application.
- `package.json`: Lists the server-side dependencies and scripts for managing the Node.js application.
- `.env`: Stores environment variables like database connection strings and server port.
- `server.js`: The main server file that sets up Express, connects to the database, and starts the server (backend entry point).
- `db/`: Database configuration and models
  - `config/`: Database connection setup
  - `models/`: MongoDB schemas (User, Chat)
  - `crud/`: CRUD operations for database entities
- `routes/`: API endpoints for users and chats
- `services/`: Core business logic
  - `agent/`: AI safety and verification agents
  - `auth/`: Authentication middleware
  - `socket/`: Real-time socket communication
- `utils/`: Utility functions and trusted sources
  - `trustedSources/`: Curated information on various teen topics
- `docs/`: API documentation (Swagger)
- `data/`: Contains the initial duck data (readonly database)
- `images/`: Contains the duck images referenced by the duck data above
- `routes/`: Defines the API endpoints and maps them to controller functions.

## Best practices & Teamwork
[Full guide](BestPractices.md)

## Support

For any issues please contact us via [mail](mailto:queenb.community@gmail.com) or open an issue.

**Happy Coding! :)**
