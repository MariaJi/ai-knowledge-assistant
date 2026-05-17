import ReactMarkdown from "react-markdown";

import "./App.css";
import { useState, useEffect, useRef } from "react";

function App() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState("all");
  
  async function uploadFile() {
    if (!selectedFile) return;

    setUploading(true);
    setUploadMessage("");

    const formData = new FormData();
    formData.append("file", selectedFile);

    const response = await fetch("http://127.0.0.1:8000/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    setUploadMessage(data.message || data.error);
	fetchDocuments();
	setSelectedFile(null)
    setQuestion("");
    setAnswer("");
    setSources([]);
    setUploading(false);
  }

  async function askAI_Old() {
  setLoading(true);
  setAnswer("");
  setSources([]);

  try {
    const response = await fetch("http://127.0.0.1:8000/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      
	  body: JSON.stringify({
			question,
			selected_document: selectedDocument,
		}),
    });

    const data = await response.json();

    setAnswer(data.answer || data.error || "No answer returned.");
    setSources(data.sources || []);
  } catch (error) {
    setAnswer("Could not connect to backend.");
  } finally {
    setLoading(false);
  }
}

async function askAI() {
	const userMessage = {
		role: "user",
		content: question,
	};

	const assistantMessage = {
		role: "assistant",
		content: "",
	};

	setMessages((prev) => [
		...prev,
		userMessage,
		assistantMessage,
	]);

  try {
    const response = await fetch("http://127.0.0.1:8000/ask-stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        selected_document: selectedDocument,
      }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let streamedAnswer = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      const chunk = decoder.decode(value);
      streamedAnswer += chunk;

      // setAnswer(streamedAnswer);
	  setMessages((prev) => {
			const updated = [...prev];

	  updated[updated.length - 1] = {
        ...updated[updated.length - 1],
        content: streamedAnswer,
		};

	  return updated;
	 });
    }
	const sourcesResponse = await fetch("http://127.0.0.1:8000/ask", {
		method: "POST",
		headers: {
		"Content-Type": "application/json",
		},
		body: JSON.stringify({
			question,
			selected_document: selectedDocument,
		}),
	});

const sourcesData = await sourcesResponse.json();
setSources(sourcesData.sources || []);
  } catch (error) {
    setAnswer("Could not connect to backend.");
  } finally {
    setLoading(false);
  }
}
  async function fetchDocuments() {
  const response = await fetch("http://127.0.0.1:8000/documents");
  const data = await response.json();
  setDocuments(data.documents || []); 
  if (selectedFile?.name === filename) {
  setSelectedFile(null);
}
}

async function deleteDocument(filename) {
  const response = await fetch(
    "http://127.0.0.1:8000/documents",
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ filename }),
    }
  );

  const data = await response.json();

  setDocuments(data.documents || []);
}

 return (
    <div className="container">
      <h1>AI Knowledge Assistant</h1>

      <div className="upload-box">
        <h2>Upload Document</h2>

        <input
          type="file"
          accept=".txt,.pdf,.docx"
          onChange={(e) => setSelectedFile(e.target.files[0])}
        />

        <button onClick={uploadFile} disabled={!selectedFile || uploading}>
          {uploading ? "Uploading..." : "Upload"}
        </button>

        {uploadMessage && <p>{uploadMessage}</p>}
      </div>
	  
	  <div className="documents-box">
		
		<h2>Uploaded Documents ({documents.length})</h2>
		<select
			value={selectedDocument}
			onChange={(e) => setSelectedDocument(e.target.value)}
		>
			<option value="all">All documents</option>

				{documents.map((doc, index) => (
					<option key={index} value={doc}>
				{doc}
			</option>
			))}
		</select>
		{documents.length === 0 ? (
			<p>No documents uploaded yet.</p>
			) : (
			<ul>
				{documents.map((doc, index) => (
					<li key={index}>
						📄 {doc}

						<button
						onClick={() => deleteDocument(doc)}
							style={{ marginLeft: "10px" }}
						>
						Delete
						</button>
					</li>
				))}
			</ul>
			)}
	  </div>
	  
      <div className="ask-box">
        <h2>Ask Question</h2>

        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about the uploaded document..."
        />
		

		{selectedFile && (
				<p>Selected: {selectedFile.name}</p>
		)}
        <button onClick={askAI} disabled={loading || !question}>
          {loading ? "Thinking..." : "Ask AI"}
        </button>
      </div>
		
		<div className="chat-box">
			 {messages.map((message, index) => (
			<div
			key={index}
				className={`message ${message.role}`}
			>
				<div className="message-role">
					{message.role === "user" ? "You" : "AI"}
				</div>

				<div className="message-content">
					<ReactMarkdown>
					{message.content}
					</ReactMarkdown>
				</div>
			</div>
			))}
			
		</div>
      {/*answer && (
        <div className="answer">
          <h2>Answer</h2>
          <div className="markdown-answer">
			<ReactMarkdown>{answer}</ReactMarkdown>
		  </div>

          {sources.length > 0 && (
            <div className="sources">
              <h3>Sources</h3>

              {sources.map((source, index) => (
                <div key={index} className="source-card">
                  <strong>{source.filename}</strong>
                  <p>{source.snippet}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )*/}
    
	{sources.length > 0 && (
            <div className="sources">
              <h3>Sources</h3>

              {sources.map((source, index) => (
                <div key={index} className="source-card">
                  <strong>{source.filename}</strong>
                  <p>{source.snippet}</p>
                </div>
              ))}
            </div>
          )}
	
	</div>
  );
}

export default App;