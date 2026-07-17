
# AI Knowledge Assistant

A full-stack AI Knowledge Assistant that uses Retrieval-Augmented Generation (RAG) to answer questions across uploaded documents, generate AI-powered summaries, compare documents, and analyze resume-to-job matches.

Built with **React**, **FastAPI**, **OpenAI GPT-4o-mini**, and **ChromaDB**.

## Highlights

- 🤖 Retrieval-Augmented Generation (RAG)
- 📄 Multi-document semantic search
- 💬 AI-powered document chat with citations
- 📊 AI document comparison
- 📄 AI document summaries
- 🎯 Resume-to-job match analysis
- 🧠 Metadata extraction & AI insights

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

### 📂 AI Document Management

Upload documents, organize them into collections, automatically generate AI topics, search by tags and topics, and manage your document library.

![Document Management](docs/images/document-management.png)


### 💬 Multi-Document Chat

Ask questions about one or more uploaded documents using natural language. The assistant retrieves relevant information from the selected documents and generates source-grounded answers.

#### 1. Ask a Question

Select a document and ask a question in natural language.

![Ask Question](docs/images/chat.png)

#### 2. AI Response

The assistant retrieves relevant content from the selected document and generates an accurate, context-aware response instead of relying solely on the language model's built-in knowledge.

![AI Response](docs/images/chat-response.png)

#### 3. Search Query & Suggested Questions

Before searching, the assistant automatically rewrites the user's question to improve retrieval quality. It also generates suggested follow-up questions to encourage further exploration.

![Search Query and Suggested Questions](docs/images/chat-search-query.png)

#### 4. Sources & Citations

Every answer includes the document sources used to generate the response, allowing users to verify where the information came from.

![Sources](docs/images/chat-sources.png)

### 📄 Resume Match Analysis

Compare a resume against a job description using AI to evaluate candidate fit, identify strengths and skill gaps, and generate personalized recommendations for improvement and interview preparation.

#### 1. Select Resume and Job Description

Choose a resume and a job description, then start the AI-powered analysis.

![Resume Match Setup](docs/images/resume-match-setup.png)

#### 2. Match Score & Summary

The assistant analyzes the selected resume against the job description, calculates an overall match score, and provides a concise summary of the candidate's fit for the role.

![Resume Match Score](docs/images/resume-match-score.png)

#### 3. Key Strengths

The assistant highlights the candidate's strengths by identifying relevant skills, experience, and qualifications that closely align with the job requirements.

![Resume Match Strengths](docs/images/resume-match-strengths.png)

#### 4. Missing Skills & Resume Improvements

The assistant identifies missing skills and qualifications, then provides actionable recommendations to strengthen the resume and improve its alignment with the selected job description.

![Resume Match Improvements](docs/images/resume-match-improvements.png)

#### 5. Interview Questions

Based on the resume and job description, the assistant generates personalized interview questions to help candidates prepare for technical and behavioral interviews.

![Resume Match Interview Questions](docs/images/resume-match-interview.png)

#### 6. Sources & Citations

Every recommendation is grounded in the uploaded resume and job description. The assistant displays the document sources used during retrieval, allowing users to verify the origin of the analysis.

![Resume Match Sources](docs/images/resume-match-sources.png)


### 📊 Document Comparison

Compare two documents using AI to identify similarities, differences, key changes, and actionable recommendations.

#### 1. Select Documents

Choose two documents to compare, then start the AI-powered comparison.

![Document Comparison Setup](docs/images/document-comparison-setup.png)

#### 2. Executive Summary

The assistant compares the selected documents and generates a high-level summary describing their overall relationship, key themes, and major findings.

![Comparison Executive Summary](docs/images/document-comparison-summary.png)

#### 3. Similarities

The assistant identifies shared topics, concepts, and information between the selected documents, helping users quickly understand where the documents align.

![Document Comparison Similarities](docs/images/document-comparison-similarities.png)

#### 4. Differences

The assistant highlights unique content, important distinctions, and key differences, making it easy to understand how the documents differ.

![Document Comparison Differences](docs/images/document-comparison-differences.png)

#### 5. Important Changes

The assistant highlights significant changes and newly introduced concepts, helping users quickly identify what has changed between the selected documents.

![Document Comparison Important Changes](docs/images/document-comparison-changes.png)

#### 6. Recommendations

Based on the comparison results, the assistant provides actionable recommendations and practical next steps to help users interpret the analysis and improve decision making.

![Document Comparison Recommendations](docs/images/document-comparison-recommendations.png)

### 📄 Document Summary

Generate AI-powered summaries that quickly capture the key information from a document, making it easier to understand the content without reading the entire document.

#### 1. Select a Document

Choose a document to summarize, then start the AI-powered summary generation.

![Document Summary Setup](docs/images/document-summary-setup.png)

#### 2. AI Summary

The assistant analyzes the selected document and generates a structured summary highlighting the main topics, key information, and important sections for quick understanding.

![Document Summary Overview](docs/images/document-summary-overview.png)

#### 3. Metadata & AI Insights

Beyond summarization, the assistant extracts structured metadata, identifies important conditions or warnings, and provides useful contextual information to help users better understand the document.

![Document Summary Metadata & Insights](docs/images/document-summary-metadata-insights.png)

#### 4. AI Insights

The assistant generates additional AI-powered insights, highlighting key observations, preparation guidance, potential risks, and practical recommendations to help users make informed decisions.

![Document Summary AI Insights](docs/images/document-summary-ai-insights.png)

### 📚 Analysis History

All AI analyses are automatically saved, allowing users to revisit previous results without repeating the analysis.

Users can:
- Browse previous summaries, document comparisons, and resume match analyses
- Filter analyses by type
- Mark frequently used analyses as favorites
- Quickly return to earlier AI-generated results

![Analysis History](docs/images/analysis-history.png)

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
