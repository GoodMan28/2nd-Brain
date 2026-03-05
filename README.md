# Second Brain: Chat Architecture & Workflow

This document outlines the architecture and data flow for the integrated chat feature within the Second Brain application. The system securely connects the React frontend, Express backend, MongoDB, and the Language Model API to provide context-aware responses based on user-saved notes.

## 📐 System Architecture

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
