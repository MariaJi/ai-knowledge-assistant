
# AI Knowledge Assistant

A full-stack Retrieval-Augmented Generation (RAG) application built with React, FastAPI, OpenAI, and ChromaDB.

## Features

### AI Features
- Multi-document chat
- Retrieval-Augmented Generation (RAG)
- Context-aware query rewriting
- AI-generated document summaries
- Resume-to-job match analysis
- Document comparison
- Suggested questions
- Related document discovery
- Auto-tagging

### Productivity Features
- Chat history
- Chat categories
- Collections
- Session management
- Search across chats
- Export chat as Markdown
- Keyboard shortcuts

## Tech Stack

### Frontend
- React
- JavaScript
- Vite

### Backend
- FastAPI
- Python

### AI Stack
- OpenAI GPT-4o-mini
- OpenAI Embeddings
- ChromaDB

## Architecture

```text
User
  ↓
React Frontend (Vite)
  ↓
FastAPI Backend
  ↓
Question Rewriter
  ↓
OpenAI Embeddings
  ↓
ChromaDB Vector Store
  ↓
GPT-4o-mini
  ↓
Source-Grounded Answer
```

The application uses a Retrieval-Augmented Generation (RAG) pipeline. Documents are chunked, embedded using OpenAI Embeddings, stored in ChromaDB, and retrieved through semantic similarity search. Retrieved context is sent to GPT-4o-mini to generate source-grounded responses.

## Screenshots

### Multi-Document Chat
Screenshot coming soon

### Resume Match Analysis
Screenshot coming soon

### Document Comparison
Screenshot coming soon

## Key Challenges Solved

- Multi-document retrieval
- Conversational query rewriting
- Source-grounded answers
- Resume/job matching workflows
- Document organization with tags and collections

## Future Enhancements

- Deployment
- Authentication
- Team collaboration
- Advanced RAG evaluation

## Author

Maria Ji
