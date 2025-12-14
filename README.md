# QueenB X AppsFlyer - BeSafe Hackathon 2025

This project template is designed for junior developers aimed at gaining hands-on experience in full-stack development. 
This project includes a Node.js server with Express and a React client, providing an opportunity to engage in frontend development, backend development, and API integration.
Specifically the template is a full-stack MERN application for managing a library of rubber ducks - but you can modify it and build a library application of your choice.

## Table of Contents

- [Installation](#installation)
   - [Prerequisites](#prerequisites) 
   - [Clone the Repository](#clone-the-repository)
   - [Server Setup](#server-setup)
   - [Client Setup](#client-setup)
- [Configuration](#configuration)
   - [Testing the Template w Random Duck Feature](#testing-the-template-w-random-duck-feature)
   - [Setting Up Environment Variables](#environment-variables)
- [Usage](#usage)
- [Best Practices for Implementing a Full Stack Feature](#best-practices-for-implementing-a-full-stack-feature)
- [Project Structure](#project-structure)
- [Summary](#summary)

## Introduction
This template includes a simple feature to display a random rubber duck from example READ ONLY database. 
This feature demonstrates the integration of the frontend with the backend and can be used to test if your setup is working correctly.

1. Client:
   - The home page contains a button labeled `Show Random Duck`.
   - When clicked, this button sends a request to the backend to fetch a random rubber duck.
   - The details of the random rubber duck, including its name and image, are displayed on the page.
2. Backend:
   - The server has an endpoint `/api/rubberDucks/random` that selects a random rubber duck from the database and returns its details in the response.

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
   - `PORT` - This variable defines the port on which your Express server will run. By default, this is set to `5000`, but you can change it to any available port number.

#### Configure the Frontend (client)

Make a copy of the `.env.example` file under the `server` folder and name it `.env`. 
This file contains the following environment variable (you don't need to touch them at this point):

* `REACT_APP_API_URL`: This variable contains the URL of your backend API. It tells your client where to send requests to interact with the server. By default, this should be set to http://localhost:5000/api, but you should change it to match your server's actual URL if different (where 5000 is the `PORT` you defined in the server `.env` file above).

## Usage

This section explains how to use the application once it’s set up and configured. Follow these steps to interact with both the client and server components of the application.

### Start the Server
1. Open a terminal in the root folder of the cloned repository, and navigate to the `server` directory: `cd server`
1. Start the Express server in development mode: `npm run dev`
   - By default, the server will run on `http://localhost:5000` (see configuration section above)

### Run the Client
1. Open a **new** terminal in the root folder of the cloned repository, and navigate to the `client` directory: `cd client`

2. Run the Frontend Client: `npm start`
   - A new browser window with the client application should open (if you close the tab, you can return to it by navigating to http://localhost:3000/ by default, unless you modified React's settings)

### Test the Application
   - Click the `Show Random Duck` button to retrieve a random duck from the database and display its details on the screen.
   - This feature helps verify that your frontend can communicate with the backend. If you see the random duck's details displayed on the page, your setup is working properly.
   - You may also use an API client (like [Postman](https://www.postman.com/)) to directly test your API endpoints.

**Please report any issues or provide feedback for further improvements!**

### Stopping the Servers

- **Stop the Express Server**: In the terminal where the server is running, press `Ctrl + C` to stop the server.
- **Stop the React Client**: In the terminal where the client is running, press `Ctrl + C` to stop the client.

### Troubleshooting

Ensure backend and frontend configurations (`.env` files) are correct.

- **Server Issues**:
  - Ensure that the React development server is running and that you have no conflicting applications using port 3000.
  - Check the terminal for error messages and 

- **Client Issues**:
  - Check the browser dev tools console for errors if the client is not displaying correctly (recommended: https://reactjs.org/link/react-devtools).
  - Check the browser dev tools network logs for failed requests

## Project Structure

- `client/`: Contains the React frontend application.
- `server/`: Contains the Express backend application, including API routes and database models.

```bash
queenb-summer-project-template-24/
│
├── client/                 # React client
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── styles/
│       ├── App.js
│       ├── index.js
│       └── package.json    # Client dependencies
│
├── server/                 # Node.js server
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── .env                # Environment variables
│   ├── server.js           # Main server file
│   └── package.json        # Server dependencies
│
├── README.md
└── package.json            # Root package.json for repo management
```

### Explanation
#### Root Directory
- queenb-summer-project-template-24/: This is the root directory of your project.

#### Client Directory
- client/: Contains the React frontend application.
   - public/: Static files like index.html, images, and other assets that need to be served directly.
   - src/: Contains the source code for the React application.
      - components/: Reusable UI components such as buttons, forms, and other elements.
      - pages/: Page components that represent different routes in the application.
      - services/: Services for making API calls and handling business logic.
      - styles/: CSS and styling files for the application.
      - App.js: The main React component that sets up routing and renders the application.
      - index.js: The entry point for the React application, responsible for rendering the App component into the DOM.
      - package.json: Lists the client-side dependencies and scripts for managing the React application.
      
#### Server Directory
- server/: Contains the Node.js backend application.
   - controllers/: Contains the logic for handling API requests and responses.
   - routes/: Defines the API endpoints and maps them to controller functions.
   - .env: Stores environment variables like database connection strings and server port.
   - server.js: The main server file that sets up Express, connects to the database, and starts the server.
   - package.json: Lists the server-side dependencies and scripts for managing the Node.js application.
   
#### Additional Files
- README.md: Provides documentation for the project, including setup instructions, usage, and other relevant information.

## Best Practices for Implementing a Full Stack Feature

When working with a full-stack application, especially in a collaborative environment, it's crucial to follow best practices to ensure smooth development and maintainability. Here are the steps and practices to implement a new feature effectively in this project:

1. Understand the Feature Requirements
   - Review the Requirements: Carefully read the product requirements document to understand the feature's goals and user interactions.
   - User Stories: Refer to user stories to get a clear picture of the user workflows and interactions needed for the feature.
2. Plan the Database Schema
   - Identify Entities: Determine the new entities required for your feature and how they relate to existing ones.
   - Design Schema: Design the database schema, avoid redundant fields.
3. Implement Server-Side Logic
   - API Endpoints: Define the necessary API endpoints following RESTful principles.
   - Controllers: Implement controller functions to handle business logic, ensuring they are modular and reusable.
   - Validation: Implement validation for incoming data to ensure it meets required criteria.
   - Error Handling: Ensure proper error handling and logging to manage and log errors gracefully.
4. Develop Client-Side Logic
   - Routing: Set up routing using the library React Router to manage navigation.
   - Components: Break down the UI into reusable components, each with a single responsibility.
   - State Management: Use the React state and Context (state management solution implemented in this project) to manage application state.
   - API Integration: Implement a service layer for API calls, keeping API logic separate from UI logic.
5. Integrate Client and Server
   - Configure Axios: make sure Axios is set with a base instance that includes the base URL and default headers for API calls.
   - Process Responses: Handle server responses and update the UI accordingly, managing loading states and errors.
6. Testing (optional here but a must in real life production)
   - Unit Tests: Write unit tests for individual components, controllers, and models.
   - Integration Tests: Ensure that different components work together correctly through integration tests.
   - End-to-End Tests: Simulate user interactions with end-to-end tests to ensure the entire feature works as expected.
8. Deployment and Monitoring (optional here but a must in real life production)

### Team Synchronization
- Regular Meetings: Hold regular meetings to discuss progress, blockers, and next steps. Daily stand-ups and weekly sync meetings can help keep everyone on the same page.
- Code Reviews: Conduct code reviews to ensure code quality and share knowledge among team members.
- Branch Management: Use a branching strategy with Git to manage feature development and integration.
- Documentation: Keep documentation updated to reflect changes and new features. This includes the README, API documentation, and any internal wiki pages.
- Clear Communication: Maintain clear communication channels (e.g., Slack, Teams) for quick discussions and updates.

### Example Workflow
- Requirement: Implement a "Create New Duck" feature where users can add a new duck to the library.
- Database Schema: Add a ducks collection with fields like name, description, image url.
- API Endpoint: Create a POST /api/ducks endpoint to handle new duck creation.
- Controller Logic: Implement the createDuck controller to validate and save the duck to the database.
- Client Component: Create a NewDuckForm component with form fields and a submit button.
- State Management: Use React state to manage form inputs and submission status.
- API Call: Use Axios in the NewDuckForm to send a POST request to POST /api/ducks.
- Testing: Write tests for the NewDuckForm component, createDuck controller, and the API endpoint.

By following these best practices, you can ensure that each feature in your full-stack application is well-designed, maintainable, and scalable. This approach will help you efficiently extend the existing infrastructure while adhering to the project requirements.

## Support

For any issues please contact us via [mail](queenb.community@gmail.com) or open an issue.

Happy Coding! :)
