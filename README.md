
# AI Knowledge Assistant

A full-stack AI Knowledge Assistant that uses Retrieval-Augmented Generation (RAG) to answer questions across uploaded documents, generate AI-powered summaries, compare documents, and analyze resume-to-job matches.

Built with **React**, **FastAPI**, **OpenAI GPT**, and **ChromaDB**.

## Features

### AI Features

- Multi-document chat
- Retrieval-Augmented Generation (RAG)
- Context-aware query rewriting
- AI-generated document summaries
- Resume-to-job match analysis
- AI document comparison
- AI-generated follow-up questions
- Related document discovery
- Metadata extraction
- AI-generated document insights
- Source-grounded answers with citations

### Productivity Features

- Multiple chat sessions
- Chat history
- Chat categories
- Collections
- Search across chats
- Match highlighting
- Previous/Next search navigation
- Analysis history
- Favorites
- Session management
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

- Built a complete Retrieval-Augmented Generation (RAG) pipeline
- Implemented semantic search using OpenAI embeddings and ChromaDB
- Added conversational query rewriting for better document retrieval
- Generated source-grounded AI responses with citations
- Built AI-powered document summaries, comparisons, and resume matching
- Designed persistent chat sessions and analysis history
- Added metadata extraction and AI-generated document insights
- Implemented search with highlighting across conversations

## What I Learned

This project gave me hands-on experience building a production-style AI application from end to end. Through this project I gained practical experience with:

- Building Retrieval-Augmented Generation (RAG) systems
- Prompt engineering for different document types
- Vector databases (ChromaDB)
- Embedding pipelines with OpenAI Embeddings
- FastAPI backend development
- React frontend development
- Streaming LLM responses
- Semantic search
- AI application architecture
- Building REST APIs for AI workflows
- Integrating LLMs into full-stack applications


## Future Enhancements

- Cloud deployment
- User authentication
- OCR support for scanned documents
- PDF annotation with source highlighting
- Team collaboration
- Advanced RAG evaluation

## Author

Maria Ji
