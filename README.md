# Second Brain

![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-19-blue.svg)

**Second Brain** is a personal knowledge management application designed to help you capture, organize, and retrieve your thoughts, links, and notes effectively. It offers a secure, streamlined workspace where you can store your ideas and easily recall them whenever needed.

---

## Core Features

- **Secure Authentication**: Robust user login and identity management via Clerk.
- **Rich Content Creation**: Full support for Markdown formatting alongside complex math formula rendering (KaTeX).
- **Custom Organization**: Keep your knowledge neatly categorized using custom tags.
- **Shareable Content**: Seamlessly generate public, shareable links for individual notes and curated collections.
- **Smart Chat Interface**: Chat with your saved notes natively via a sophisticated Language Model API integration.

## Tech Stack

### Frontend (`/client`)
- **React 19** & **Vite**: Blazing fast UI development and builds.
- **TypeScript**: Static typing for robust application logic.
- **Tailwind CSS** & **Framer Motion**: Beautiful utility-first styling with fluid animations.
- **Clerk**: Comprehensive user authentication.
- **React Router DOM**: Client-side routing.
- **React Markdown, Remark Math, & Rehype KaTeX**: Extensive markdown parsing and dynamic math rendering.

### Backend (`/server`)
- **Node.js** & **Express.js**: Fast, scalable server-side infrastructure.
- **TypeScript**: Fully typed API endpoints.
- **MongoDB & Mongoose**: Flexible, schema-based NoSQL database management.
- **CORS** & **dotenv**: Secure cross-origin resource sharing and environment variable management.

## Project Structure

This project follows a monorepo setup:

```
2ndBrain/
├── client/     # Frontend React application (Vite)
└── server/     # Backend Express.js API
```

## API Routes Summary

The backend exposes the following core RESTful endpoints:

| Route Prefix         | Description                                                          |
|----------------------|----------------------------------------------------------------------|
| `/api/v1/user`       | Handles user metadata and account-related operations.                |
| `/api/v1/content`    | Core CRUD operations for notes, links, and text content.             |
| `/api/v1/tag`        | Creation, assignment, and management of organizational tags.         |
| `/api/v1/share`      | Generation, retrieval, and revocation of public shareable links.     |
| `/api/v1/chat`       | Routes processing Language Model API queries against user content.   |

## Local Setup Instructions

Follow these steps to run the application locally.

### 1. Clone the repository
```bash
git clone <repository-url>
cd 2ndBrain
```

### 2. Install Dependencies
You need to install dependencies for both the frontend and the backend.

**Root terminal:**
```bash
# Install frontend dependencies
cd client
npm install

# In a new terminal tab, install backend dependencies
cd ../server
npm install
```

### 3. Environment Variables
You must set up environment variables in both the `client` and `server` directories.

**Frontend (`client/.env`)**
Create a `.env` file in the `client` directory:
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

**Backend (`server/.env`)**
Create a `.env` file in the `server` directory:
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
FRONTEND_URL=http://localhost:5173
```

### 4. Start the Application

**Run Frontend:**
```bash
cd client
npm run dev
```

**Run Backend:**
```bash
cd server
npm run dev
```

---

## Chat Architecture & Workflow

This document outlines the architecture and data flow for the integrated chat feature within the Second Brain application. The system securely connects the React frontend, Express backend, MongoDB, and the Language Model API to provide context-aware responses based on user-saved notes.

### System Architecture

The following sequence diagram illustrates the step-by-step lifecycle of a single chat request.

```mermaid
sequenceDiagram
    actor User
    participant Client as React Frontend
    participant Server as Express Backend (/api/v1/chat)
    participant DB as MongoDB
    participant LLM as Language Model API

    User->>Client: Types question in the chat interface
    Client->>Server: POST /api/v1/chat (Message + Clerk Auth Token)
    
    rect rgb(240, 248, 255)
        Note over Server,DB: 1. Authentication & Context Retrieval
        Server->>Server: Validate Clerk session
        Server->>DB: Query user's saved content/tags
        DB-->>Server: Return relevant notes for context
    end

    rect rgb(245, 245, 245)
        Note over Server,LLM: 2. Model Processing
        Server->>LLM: Send prompt (User Query + Retrieved Notes)
        LLM-->>Server: Stream or return generated response
    end

    rect rgb(255, 245, 238)
        Note over Server,DB: 3. Storage & Response
        Server->>DB: Save the new chat interaction
        Server-->>Client: Return standard JSON response
    end

    Client->>User: Render response via React Markdown & KaTeX
```

### 3-Step Chat Pipeline

Behind the scenes, the Express backend executes a sophisticated 3-step pipeline to ensure high-quality, context-aware responses:

```mermaid
flowchart TD
    A([User Query & Chat History]) --> B(Step 1: Query Rewriter)
    B -->|Formulated Search Intent| C(Step 2: The Ranker)
    C -->|Perform Semantic Search| D[(MongoDB: User Notes)]
    D -->|Retrieve Relevant Content| C
    C -->|Pass Filtered Context| E(Step 3: The Generator)
    E -->|Formulate Answer with Citations| F([Final JSON Response])

    style B fill:#e1f5fe,stroke:#03a9f4,stroke-width:2px
    style C fill:#e8f5e9,stroke:#4caf50,stroke-width:2px
    style E fill:#fff3e0,stroke:#ff9800,stroke-width:2px
```


---

### Author

Yours Lovingly!! <br>
<b>ABHINEET ANAND</b>
