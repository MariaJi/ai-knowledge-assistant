import ReactMarkdown from "react-markdown";

import "./App.css";
import { useState, useEffect, useRef } from "react";

function App() {
  const [question, setQuestion] = useState("");
  //const [currentSessionId, setCurrentSessionId] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatSearchTerm, setChatSearchTerm] = useState("");
  const [messageSearchTerm, setMessageSearchTerm] = useState("");

  const [darkMode, setDarkMode] = useState(() => {
  return localStorage.getItem("darkMode") === "true";
  });

  const [copiedMessageIndex, setCopiedMessageIndex] = useState(null);
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  
  const [compareDocumentA, setCompareDocumentA] = useState("");
  const [compareDocumentB, setCompareDocumentB] = useState("");
  
  const [recentSearches, setRecentSearches] = useState(() => {
  return JSON.parse(localStorage.getItem("recentSearches") || "[]");
});


  const [currentSessionId, setCurrentSessionId] = useState(() => {
  const savedSessions = localStorage.getItem("chatSessions");
  

  if (savedSessions) {
    const parsed = JSON.parse(savedSessions);

    if (parsed.length > 0) {
      return parsed[0].id;
    }
  }

  return 1;
});
  /*const [messages, setMessages] = useState(() => {
  const savedMessages = localStorage.getItem("chatMessages");

  if (savedMessages) {
    return JSON.parse(savedMessages);
  }

  return [];
  }); */
  
  const [sessions, setSessions] = useState(() => {
  const savedSessions = localStorage.getItem("chatSessions");

  if (savedSessions) {
    return JSON.parse(savedSessions);
  }

  return [
    {
      id: 1,
      title: "New Chat",
      messages: [],
	  sources: [],
	  selectedDocuments: [],
    },
  ];
});
const [documents, setDocuments] = useState([]);
const currentSession = sessions.find(
  (session) => session.id === currentSessionId
);

const messages = currentSession?.messages || [];

const pinnedMessages = messages.filter(
  (message) => message.isPinned
);

const userMessageCount = messages.filter(
  (message) => message.role === "user"
).length;

const aiMessageCount = messages.filter(
  (message) => message.role === "assistant"
).length;

const totalMessageCount = messages.length;

const documentCount = documents.length;
const totalWords = messages.reduce((count, message) => {
  return count + String(message.content || "").split(/\s+/).filter(Boolean).length;
}, 0);
const filteredMessages = messages.filter((message) =>
  String(message.content || "")
  .toLowerCase()
  .includes(chatSearchTerm.toLowerCase())
);
const goToSearchResult = (index) => {
  const element = searchResultRefs.current[index];

  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }
};

const nextSearchResult = () => {
  if (filteredMessages.length === 0) return;

  const nextIndex =
    (currentSearchIndex + 1) % filteredMessages.length;

  setCurrentSearchIndex(nextIndex);
  goToSearchResult(nextIndex);
};

const previousSearchResult = () => {
  if (filteredMessages.length === 0) return;

  const prevIndex =
    (currentSearchIndex - 1 + filteredMessages.length) %
    filteredMessages.length;

  setCurrentSearchIndex(prevIndex);
  goToSearchResult(prevIndex);
};



const isSearching = chatSearchTerm.trim() !== "";
//const sources = currentSession?.sources || [];

   const [answer, setAnswer] = useState("");
  //const [sources, setSources] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  //const [selectedDocument, setSelectedDocument] = useState("all");
  const chatBoxRef = useRef(null);
  const searchResultRefs = useRef([]);
  const chatSearchInputRef = useRef(null);
  
  const [openSources, setOpenSources] = useState({});
  const selectedDocument = currentSession?.selectedDocument || [];
  
  const selectedDocuments = currentSession?.selectedDocuments || [];
  
  const [selectedCollection, setSelectedCollection] = useState("All");


  const [documentCollections, setDocumentCollections] = useState(() => {
	return JSON.parse(localStorage.getItem("documentCollections") || "{}");
	});
	
  const [documentTags, setDocumentTags] = useState(() => {
  return JSON.parse(localStorage.getItem("documentTags") || "{}");
	});

const [tagSearch, setTagSearch] = useState("");
useEffect(() => {
  localStorage.setItem(
    "documentTags",
    JSON.stringify(documentTags)
  );
}, [documentTags]);

 
  
  const filteredDocuments = documents.filter((doc) => {
  const matchesCollection =
    selectedCollection === "All" ||
    (documentCollections[doc] || "Uncategorized") === selectedCollection;

  const matchesTag =
    tagSearch.trim() === "" ||
    (documentTags[doc] || "")
      .toLowerCase()
      .includes(tagSearch.toLowerCase());

  return matchesCollection && matchesTag;
});

  const [categoryFilter, setCategoryFilter] = useState("All");


useEffect(() => {
  console.log("Saving collections:", documentCollections);

  localStorage.setItem(
    "documentCollections",
    JSON.stringify(documentCollections)
  );
}, [documentCollections]);

  useEffect(() => {
    if (chatBoxRef.current) {
		chatBoxRef.current.scrollTop =
        chatBoxRef.current.scrollHeight;
    }
  }, [messages]);
  
  useEffect(() => {
  if (chatSearchTerm.trim() === "") return;
  if (filteredMessages.length === 0) return;

  setCurrentSearchIndex(0);

  setTimeout(() => {
    goToSearchResult(0);
  }, 100);
}, [chatSearchTerm, filteredMessages.length]);
  
  useEffect(() => {
  fetchDocuments();
  }, []);
 /* useEffect(() => {
  localStorage.setItem("chatMessages", JSON.stringify(messages));
}, [messages]);*/

useEffect(() => {
  localStorage.setItem("chatSessions", JSON.stringify(sessions));
}, [sessions]);
 

useEffect(() => {
  localStorage.setItem("darkMode", darkMode);
}, [darkMode]);

useEffect(() => {
  function handleKeyDown(e) {
    // Ctrl + K → Focus search
    if (e.ctrlKey && e.key.toLowerCase() === "k") {
      e.preventDefault();
      chatSearchInputRef.current?.focus();
    }
	
	// Alt + N → New Chat
	if (e.altKey && e.key.toLowerCase() === "n") {
		e.preventDefault();
		createNewChat();
	}
	// Esc → Clear sidebar search
	if (e.key === "Escape") {
	setChatSearchTerm("");
	}
  }


  window.addEventListener("keydown", handleKeyDown);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}, []);


async function uploadFile() {
  if (!selectedFile) return;

  setUploading(true);
  setUploadMessage("");

  try {
    const formData = new FormData();
    formData.append("file", selectedFile);

    const response = await fetch("http://127.0.0.1:8000/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    setUploadMessage(data.message || data.error || "Upload complete.");

    fetchDocuments();
    setSelectedFile(null);
    setQuestion("");
    setAnswer("");
    updateCurrentSessionSources([]);
  } catch (error) {
    setUploadMessage(`Could not upload file: ${error.message}`);
  } finally {
    setUploading(false);
  }
}
 
function toggleSources(index) {
  setOpenSources((prev) => ({
    ...prev,
    [index]: !prev[index],
  }));
}

function updateCurrentSessionMessages(newMessages) {
  setSessions((prevSessions) =>
    prevSessions.map((session) =>
      session.id === currentSessionId
        ? { ...session, messages: newMessages, updatedAt: new Date().toISOString(), }
        : session
    )
  );
}

function updateCurrentSessionSources(newSources) {
  setSessions((prevSessions) =>
    prevSessions.map((session) =>
      session.id === currentSessionId
        ? { ...session, sources: newSources }
        : session
    )
  );
}
  function createNewChat() {
	const newSession = {
		id: Date.now(),
		title: "New Chat",
		messages: [],
		sources: [],
		selectedDocument: [],
		isFavorite: false,
		category: "General",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
  };


  setSessions((prev) => [...prev, newSession]);

  setCurrentSessionId(newSession.id);
}

function updateCurrentSessionSelectedDocument(documentName) {
  setSessions((prevSessions) =>
    prevSessions.map((session) =>
      session.id === currentSessionId
        ? { ...session, selectedDocument: documentName }
        : session
    )
  );
}

//Add new function for multi-document chat

function updateCurrentSessionSelectedDocuments(documentNames) {
  setSessions((prevSessions) =>
    prevSessions.map((session) =>
      session.id === currentSessionId
        ? { ...session, selectedDocuments: documentNames }
        : session
    )
  );
}

function updateSessionTitle(sessionId, title) {
  setSessions((prevSessions) =>
    prevSessions.map((session) =>
      session.id === sessionId
        ? { ...session, title }
        : session
    )
  );
}

 
async function askAI(questionOverride = null) {
	setLoading(true);
	const questionToAsk = questionOverride || question;
	updateCurrentSessionSources([]);
	const userMessage = {
		role: "user",
		content: questionToAsk,
	};
	setQuestion("");
	const assistantMessage = {
  role: "assistant",
  content: "Thinking...",
  sources: [],
};

	const newMessages = [
		...messages,
		userMessage,
		assistantMessage,
	];

	updateCurrentSessionMessages(newMessages);
	if (messages.length === 0) {
		updateSessionTitle(
			currentSessionId,
			questionToAsk.slice(0, 30)
	);
}
  try {
    const response = await fetch("http://127.0.0.1:8000/ask-stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
  question: questionToAsk,
  selected_documents: selectedDocuments,
  chat_history: messages.slice(-10).map((message) => ({
    role: message.role,
    content: message.content,
  })),
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
	  /*setMessages((prev) => {
			const updated = [...prev];

	  updated[updated.length - 1] = {
        ...updated[updated.length - 1],
        content: streamedAnswer,
		};

	  return updated;
	 });*/
	 const updatedMessages = [
    ...newMessages.slice(0, -1),
    {
      role: "assistant",
      content: streamedAnswer,
    },
	];

	updateCurrentSessionMessages(updatedMessages);
    }
	
	const sourcesResponse = await fetch("http://127.0.0.1:8000/ask", {
		method: "POST",
		headers: {
		"Content-Type": "application/json",
		},
		body: JSON.stringify({
			question: questionToAsk,
			selected_document: selectedDocument,
		}),
	});

const sourcesData = await sourcesResponse.json();
//setSources(sourcesData.sources || []);
// updateCurrentSessionSources(sourcesData.sources || []);
const finalMessages = [
  ...newMessages.slice(0, -1),
  {
    role: "assistant",
    content: streamedAnswer,
    sources: sourcesData.sources || [],
  },
];

updateCurrentSessionMessages(finalMessages);

  } catch (error) {
    const errorMessages = [
    ...newMessages.slice(0, -1),
    {
      role: "assistant",
      content: "Error: Could not connect to server.",
      sources: [],
    },
  ];

  updateCurrentSessionMessages(errorMessages);
  } finally {
    setLoading(false);
  }
}
 


 async function fetchDocuments() {
  const response = await fetch("http://127.0.0.1:8000/documents");
  const data = await response.json();
  setDocuments(data.documents || []); 
  
}

async function deleteDocument_Old(filename) {
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

  if (selectedDocument === filename) {
    updateCurrentSessionSelectedDocument("all");
  }
}

function deleteChat(sessionId) {
	const shouldDelete = window.confirm(
    "Are you sure you want to delete this chat?"
  );

  if (!shouldDelete) {
    return;
  }
  const remainingSessions = sessions.filter(
    (session) => session.id !== sessionId
  );

  if (remainingSessions.length === 0) {
    const newSession = {
      id: Date.now(),
      title: "New Chat",
      messages: [],
      sources: [],
      selectedDocument: "all",
    };

    setSessions([newSession]);
    setCurrentSessionId(newSession.id);
    return;
  }

  setSessions(remainingSessions);

  if (currentSessionId === sessionId) {
    setCurrentSessionId(remainingSessions[0].id);
  }
}

function clearCurrentChat() {
  const shouldClear = window.confirm(
    "Clear all messages in this chat?"
  );

  if (!shouldClear) {
    return;
  }

  updateCurrentSessionMessages([]);
}

function renameChat(sessionId) {
  const session = sessions.find(
    (session) => session.id === sessionId
  );

  const newTitle = prompt(
    "Enter a new chat title:",
    session?.title || "New Chat"
  );

  if (!newTitle || newTitle.trim() === "") {
    return;
  }

  updateSessionTitle(sessionId, newTitle.trim());
}

function exportCurrentChat() {
  if (!currentSession) return;

  const text = currentSession.messages
    .map((message) => {
      const role = message.role === "user" ? "You" : "AI";

      let messageText = `${role}:\n${message.content}`;

      if (message.sources && message.sources.length > 0) {
        const sourcesText = message.sources
          .map((source) => {
            return `Source: ${source.filename}\n${source.snippet}`;
          })
          .join("\n\n");

        messageText += `\n\nSources:\n${sourcesText}`;
      }

      return messageText;
    })
    .join("\n\n--------------------\n\n");

  const blob = new Blob([text], {
    type: "text/plain",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${currentSession.title}.txt`;
  link.click();

  URL.revokeObjectURL(url);
}

async function searchDocuments() {
  if (!searchQuery.trim()) {
    return;
  }

  const response = await fetch("http://127.0.0.1:8000/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: searchQuery,
      selected_document: selectedDocument,
    }),
  });

  const data = await response.json();

  setSearchResults(data.results || []);
}




async function copyMessage(content, index) {
  try {
    await navigator.clipboard.writeText(content);

    setCopiedMessageIndex(index);

    setTimeout(() => {
      setCopiedMessageIndex(null);
    }, 2000);

  } catch (error) {
    alert("Could not copy message.");
  }
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightText(text, searchTerm) {
  if (!searchTerm?.trim()) return text;

  const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, "gi");

  return text.split(regex).map((part, index) =>
    regex.test(part) ? (
      <mark key={index} className="search-highlight">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

async function summarizeDocument() {
  if (selectedDocument === "all") return;

  try {
    const response = await fetch("http://127.0.0.1:8000/summarize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        selected_document: selectedDocument,
      }),
    });

    const data = await response.json();

    const summaryMessage = {
		role: "assistant",
		content: `📄 Summary of ${selectedDocument}\n\n${data.summary}`,
		sources: [],
	};

	updateCurrentSessionMessages([
		...messages,
		summaryMessage,
	]);
  } catch (error) {
    alert("Could not summarize document.");
  }
}

async function compareDocuments() {
    if (!compareDocumentA || !compareDocumentB) {
        alert("Please select two documents.");
        return;
    }

    try {
        const response = await fetch(
            "http://127.0.0.1:8000/compare",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    document_a: compareDocumentA,
                    document_b: compareDocumentB,
                }),
            }
        );

        const data = await response.json();

        const comparisonMessage = {
            role: "assistant",
            content: data.comparison,
            isComparison: true,
        };

        updateCurrentSessionMessages([
            ...messages,
            comparisonMessage,
        ]);

    } catch (error) {
        alert("Compare failed.");
    }
}

function exportMessageAsMarkdown(message, index) {
  let filePrefix = "ai-response";

  if (message.content.includes("Summary of")) {
    filePrefix = "ai-summary";
  }

  if (message.isComparison) {
    filePrefix = "ai-comparison";
  }

  const blob = new Blob([message.content], {
    type: "text/markdown",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${filePrefix}-${index + 1}.md`;
  link.click();

  URL.revokeObjectURL(url);
}

function exportChatAsMarkdown() {
  if (messages.length === 0) return;

  const markdown = messages
    .map((message) => {
      const roleLabel = message.role === "user" ? "User" : "AI";

      return `## ${roleLabel}\n\n${message.content}`;
    })
    .join("\n\n---\n\n");

  const blob = new Blob([`# Chat Session\n\n${markdown}`], {
    type: "text/markdown",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "chat-session.md";
  link.click();

  URL.revokeObjectURL(url);
}

function regenerateResponse(index) {
  const previousUserMessage = [...messages]
    .slice(0, index)
    .reverse()
    .find((message) => message.role === "user");

  if (!previousUserMessage) {
    alert("No previous user question found.");
    return;
  }

  askAI(previousUserMessage.content);
}

function toggleFavoriteSession(sessionId) {
  setSessions((prevSessions) =>
    prevSessions.map((session) =>
      session.id === sessionId
        ? { ...session, isFavorite: !session.isFavorite }
        : session
    )
  );
}

function togglePinnedMessage(index) {
  const updatedMessages = messages.map((message, messageIndex) =>
    messageIndex === index
      ? { ...message, isPinned: !message.isPinned }
      : message
  );

  updateCurrentSessionMessages(updatedMessages);
}

function updateSessionCategory(sessionId, newCategory) {
  setSessions((prevSessions) =>
    prevSessions.map((session) =>
      session.id === sessionId
        ? { ...session, category: newCategory }
        : session
    )
  );
}
function toggleCategory(category) {
  setCollapsedCategories((prev) => ({
    ...prev,
    [category]: !prev[category],
  }));
}

function expandAllCategories() {
  setCollapsedCategories({});
}

function collapseAllCategories() {
  const collapsed = {};

  Object.keys(groupedSessions).forEach((category) => {
    collapsed[category] = true;
  });

  setCollapsedCategories(collapsed);
}


function getSessionSearchPreview(session) {
  const search = chatSearchTerm.toLowerCase().trim();

  if (!search) return "";

  const matchingMessage = session.messages?.find(
    (message) =>
      message.content?.toLowerCase().includes(search)
  );

  if (!matchingMessage) return "";

  const text = matchingMessage.content;

  return text.length > 60
    ? text.substring(0, 60) + "..."
    : text;
}

const filteredSessions = sessions.filter((session) => {
  const matchesCategory =
    categoryFilter === "All" ||
    session.category === categoryFilter;

  const search = chatSearchTerm.toLowerCase().trim();

  const matchesSearch =
    search === "" ||
    session.title?.toLowerCase().includes(search) ||
    session.messages?.some((message) =>
      message.content?.toLowerCase().includes(search)
    );

  return matchesCategory && matchesSearch;
});



const groupedSessions = filteredSessions.reduce((groups, session) => {
  const category = session.category || "General";

  if (!groups[category]) {
    groups[category] = [];
  }

  groups[category].push(session);

  return groups;
}, {});

 console.log(groupedSessions);

function toggleCategory(category) {
  setCollapsedCategories((prev) => ({
    ...prev,
    [category]: !prev[category],
  }));
}

function saveRecentSearch(searchTerm) {
  const trimmedSearch = searchTerm.trim();

  if (trimmedSearch.length < 3) return;

  const updatedSearches = [
    trimmedSearch,
    ...recentSearches.filter(
      (search) => search.toLowerCase() !== trimmedSearch.toLowerCase()
    ),
  ].slice(0, 5);

  setRecentSearches(updatedSearches);

  localStorage.setItem(
    "recentSearches",
    JSON.stringify(updatedSearches)
  );
}

 return (

 <div className={`app-layout ${darkMode ? "dark-mode" : ""}`}>
	<button
		className="sidebar-toggle"
		onClick={() => setSidebarOpen(!sidebarOpen)}
		>
		☰
	</button>
	{sidebarOpen && (
		<aside className="sidebar">
		<h2>Chats</h2>

		<button onClick={createNewChat}>
		+ New Chat
		</button>
<select  className="category-filter"
  value={categoryFilter}
  onChange={(e) =>
    setCategoryFilter(e.target.value)
  }
>
  <option value="All">All Categories</option>
  <option value="General">General</option>
  <option value="Work">Work</option>
  <option value="AI">AI</option>
  <option value="Travel">Travel</option>
  <option value="Personal">Personal</option>
</select>
	<input
  className="chat-search-input"
  type="text"
  placeholder="Search chats..."
  ref={chatSearchInputRef}
  value={chatSearchTerm}
  onChange={(e) => setChatSearchTerm(e.target.value)}
  onBlur={() => saveRecentSearch(chatSearchTerm)}
  
	/>
	{recentSearches.length > 0 && (
  <div className="recent-searches">
    <div className="recent-searches-title">
      Recent Searches
    </div>

    {recentSearches.map((search) => (
      <button
        key={search}
        className="recent-search-button"
        onClick={() => {
				setChatSearchTerm(search);
				saveRecentSearch(search);
		}}
      >
        {search}
      </button>
    ))}
  </div>
)}
	<div className="category-controls">
  <button onClick={expandAllCategories}>
    Expand All
  </button>

  <button onClick={collapseAllCategories}>
    Collapse All
  </button>
</div>
		<div className="session-list">

		{Object.entries(groupedSessions).map(([category, categorySessions]) => (
  <div key={category} className="category-group">
    <button
      className="category-group-header"
      onClick={() => toggleCategory(category)}
    >
      {collapsedCategories[category] ? "▶" : "▼"} {category} ({categorySessions.length})
    </button>

    {!collapsedCategories[category] && (
  <div className="category-sessions">
			{categorySessions
  .sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;

    const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();

    return bTime - aTime;
  })
  .map((session) => (
			<div key={session.id} className="session-item">
			<div className="session-info">
				<button
				className={`session-title-button ${
				currentSessionId === session.id ? "active-session" : ""
				}`}
				onClick={() => setCurrentSessionId(session.id)}
				>
				{session.title}
				</button>
				{chatSearchTerm.trim() !== "" &&
					getSessionSearchPreview(session) && (
				<div className="session-search-preview">
				↳ {getSessionSearchPreview(session)}
				</div>
				)}
			</div>

		
		<select
			className="session-category-select"
			value={session.category || "General"}
			onChange={(e) =>
			updateSessionCategory(
			session.id,
			e.target.value
		)
			}
		>
			<option value="General">General</option>
			<option value="Work">Work</option>
			<option value="AI">AI</option>
			<option value="Travel">Travel</option>
			<option value="Personal">Personal</option>
		</select>

<button className="favorite-chat-button">
  ...
</button>
				
				<button
					onClick={() => toggleFavoriteSession(session.id)}
					className="favorite-chat-button"
				>
					{session.isFavorite ? "⭐" : "☆"}
				</button>
				<button
				className="rename-chat-button"
				onClick={() => renameChat(session.id)}
				>
				✏️
				</button>

				<button
				className="delete-chat-button"
				onClick={() => deleteChat(session.id)}
				>
				×
				</button>
				
			</div>
			))}
      </div>
    )}
  </div>
))}
		</div>
	</aside>
	)}
	
	<main className="container">
		<div className="current-chat-header">
  {currentSession?.title}
	
   <button
     className="theme-toggle-button"
     onClick={() => setDarkMode(!darkMode)}
   >
    {darkMode ? "☀️ Light" : "🌙 Dark"}
   </button>


  <button
    className="export-chat-button"
    onClick={exportCurrentChat}
	disabled={messages.length === 0}
  >
    Save Session
  </button>
  <button
      className="clear-chat-button"
      onClick={clearCurrentChat}
	  disabled={messages.length === 0}
    >
      Clear Chat
    </button>
	
	<button
		className="export-chat-button"
		onClick={exportChatAsMarkdown}
		disabled={messages.length === 0}
	>
		Export Markdown
	</button>
</div>


<div
  className="current-document-header"
  title={selectedDocument}
	>
	Document: {
    selectedDocument === "all"
      ? "All documents"
      : selectedDocument
		}
</div>


		<h1>AI Knowledge Assistant</h1>
		
		<div className="chat-statistics">
				<strong>Stats:</strong>
				{" "}Messages: {messages.length}
				{" | "}User: {userMessageCount}
				{" | "}AI: {aiMessageCount}
				{" | "}Documents: {documentCount}
				{" | "}Words: {totalWords}
		</div>
		<div className="upload-box">
			<h2>Upload Document</h2>

			<input
				type="file"
				accept=".txt,.pdf,.docx"
				 onChange={(e) => {
					setSelectedFile(e.target.files[0]);
					setUploadMessage("");
					}}
				/>

			<button onClick={uploadFile} disabled={!selectedFile || uploading}>
				{uploading ? "Uploading..." : "Upload"}
			</button>

			{uploadMessage && <p>{uploadMessage}</p>}
		</div>
	  
		<div className="documents-box">
		
			<h2>Uploaded Documents ({documents.length})</h2>
			
			<div className="collection-filter">
			<label>Collection: </label>

			<select
			value={selectedCollection}
			onChange={(e) => setSelectedCollection(e.target.value)}
			>
			<option value="All">All Collections</option>
			<option value="Uncategorized">Uncategorized</option>
			<option value="Job Search">Job Search</option>
			<option value="AI Learning">AI Learning</option>
			<option value="Work">Work</option>
			<option value="Travel">Travel</option>
			</select>
		</div>
		
		<div className="tag-filter">
				<label>Tag Search: </label>

				<input
					type="text"
					value={tagSearch}
					onChange={(e) => setTagSearch(e.target.value)}
					placeholder="Search tags..."
					/>
		</div>
		
			<select
				multiple
				value={selectedDocuments}
				onChange={(e) => {
				const selected = Array.from(
					e.target.selectedOptions,
				(option) => option.value
				);

				

				updateCurrentSessionSelectedDocuments(selected);
				}}
			>

				{documents.map((doc) => (
					<option key={doc} value={doc}>
					{doc}
					</option>
				))}
			
			</select>
			
			<p className="selected-documents-count">
						{selectedDocuments.length === 0
						? "Searching all documents"
						: `${selectedDocuments.length} document(s) selected`}
			</p>
<h3>Compare Documents</h3>

<select
    value={compareDocumentA}
    onChange={(e) => setCompareDocumentA(e.target.value)}
>
    <option value="">Select Document A</option>

    {filteredDocuments.map((doc, index) => (
        <option key={index} value={doc}>
            {doc}
        </option>
    ))}
</select>

<select
    value={compareDocumentB}
    onChange={(e) => setCompareDocumentB(e.target.value)}
>
    <option value="">Select Document B</option>

    {documents.map((doc, index) => (
        <option key={index} value={doc}>
            {doc}
        </option>
    ))}
</select>

<button onClick={compareDocuments}>
    Compare Documents
</button>


			<button
					onClick={summarizeDocument}
					disabled={selectedDocument === "all"}
					>
				📄 Summarize Document
			</button>
			{documents.length === 0 ? (
  <p>No documents uploaded yet.</p>
) : (
  <>
    {filteredDocuments.length === 0 ? (
      <p>No documents in this collection.</p>
    ) : (
      <ul>
        {filteredDocuments.map((doc, index) => (
          <li key={index}
			className="document-row">
            📄 {doc}

            <select
              value={documentCollections[doc] || "Uncategorized"}
              onChange={(e) =>
                setDocumentCollections({
                  ...documentCollections,
                  [doc]: e.target.value,
                })
              }
              style={{ marginLeft: "10px" }}
            >
              <option value="Uncategorized">Uncategorized</option>
              <option value="Job Search">Job Search</option>
              <option value="AI Learning">AI Learning</option>
              <option value="Work">Work</option>
              <option value="Travel">Travel</option>
            </select>

<input
  type="text"
  value={documentTags[doc] || ""}
  onChange={(e) =>
    setDocumentTags({
      ...documentTags,
      [doc]: e.target.value,
    })
  }
  placeholder="Tags: RAG, React, OpenAI"
  style={{
  marginLeft: "10px",
  width: "150px",
}}
/>


            <button
              onClick={() => deleteDocument(doc)}
               style={{
    marginLeft: "10px",
    display: "inline-block",
    verticalAlign: "top",
  }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    )}
  </>
)}
			
		</div>
		
		<div className="search-box">
  <h2>Search Documents</h2>

  <input
    type="text"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    placeholder="Search uploaded documents..."
  />

  <button onClick={searchDocuments} disabled={!searchQuery.trim()}>
    Search
  </button>

  {searchResults.length > 0 && (
    <div className="search-results">
      <h3>Search Results</h3>

      {searchResults.map((result, index) => (
        <div key={index} className="search-result-card">
          <strong>{result.filename}</strong>
          <p>{result.snippet}</p>
        </div>
      ))}
    </div>
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
			<button onClick={() => askAI()} disabled={loading || !question}>
				{loading ? "Thinking..." : "Ask AI"}
			</button>
		</div>
		
		<div className="chat-search-box">
  <input
    type="text"
	value={messageSearchTerm}
	onChange={(e) => {
	setMessageSearchTerm(e.target.value);
	setCurrentSearchIndex(0);
}}
    placeholder="Search this chat..."
  />
   {messageSearchTerm && (
  <button
    className="clear-search-button"
    onClick={() => setMessageSearchTerm("")}
  >
    Clear
  </button>
)}
</div>

{chatSearchTerm.trim() !== "" && (
  <p className="chat-search-count">
    {filteredMessages.length === 0
      ? "No matching messages"
      : `${filteredMessages.length} matching message${
          filteredMessages.length === 1 ? "" : "s"
        }`}
  </p>
)}
{isSearching && filteredMessages.length > 0 && (
  <>
    <button onClick={previousSearchResult}>
      ↑
    </button>

    <span className="search-navigation">
  {Math.min(currentSearchIndex + 1, filteredMessages.length)} / {filteredMessages.length}
</span>

    <button onClick={nextSearchResult}>
      ↓
    </button>
  </>
)}
		{messages.length === 0 ? (
  <div className="empty-chat-message">
    No messages yet. Ask a question to start this chat.
  </div>
) : (
		
		<div className="chat-box" ref={chatBoxRef}>
		{pinnedMessages.length > 0 && (
  <div className="pinned-messages">
    
	<h4>📌 Pinned Messages ({pinnedMessages.length})</h4>
    {pinnedMessages.map((message, index) => (
      <div
        key={index}
        className="pinned-message-item"
      >
        {message.content}
      </div>
    ))}
  </div>
)}
			 {filteredMessages.map((message, index) => (
			<div
					key={index}
					ref={(el) => (searchResultRefs.current[index] = el)}
					className={`message ${message.role}`}
			>
				<div className="message-role">
					{message.role === "user" ? "You" : "AI"}

					{message.role === "assistant" && (
					 <>
						<button
								className="copy-message-button"
								onClick={() => copyMessage(message.content, index)}
							>
							{copiedMessageIndex === index ? "✓" : "📋"}
						</button>
						<button
								className="export-message-button"
								onClick={() => exportMessageAsMarkdown(message, index)}
						>
							⬇️ MD
						</button>
						<button
								className="regenerate-message-button"
								onClick={() => regenerateResponse(index)}
						>
							↻ Regenerate
						</button>
						<button
							className="pin-message-button"
							onClick={() => togglePinnedMessage(index)}
						>
							{message.isPinned ? "📌" : "📍"}
						</button>
						 </>
					)}
				</div>

				<div className="message-content">
					
				{message.role === "assistant" ? (
 <ReactMarkdown
  components={{
    p: ({ children }) => (
      <p>{highlightText(String(children), messageSearchTerm)}</p>
    ),
    li: ({ children }) => (
      <li>{highlightText(String(children), messageSearchTerm)}</li>
    ),
  }}
>
  {message.content || "_Thinking..._"}
</ReactMarkdown>
) : (
  <div>
    {highlightText(message.content, messageSearchTerm)}
  </div>
)}
					{message.sources && message.sources.length > 0 && (
  <div className="message-sources">
    <button
      className="sources-toggle"
      onClick={() => toggleSources(index)}
    >
      {openSources[index] ? "▼" : "▶"} Sources ({message.sources.length})
    </button>

    {openSources[index] && (
      <div>
        {message.sources.map((source, sourceIndex) => (
          <div key={sourceIndex} className="message-source-card">
            <strong>{source.filename}</strong>
            <p>{source.snippet}</p>
          </div>
        ))}
      </div>
    )}
  </div>
)}
				
				
				</div>
			</div>
				))}
			
		</div>
   )}   
    {/* 
			{{sources.length > 0 && (
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
	*/}
		
	</main>
</div>
 );
}

export default App;