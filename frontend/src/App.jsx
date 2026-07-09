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

const [analysisHistory, setAnalysisHistory] = useState(() => {
  const saved = localStorage.getItem("analysisHistory");
  return saved ? JSON.parse(saved) : [];
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
  const [resumeDocument, setResumeDocument] = useState("");
  const [jobDescriptionDocument, setJobDescriptionDocument] = useState("");
  
  
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
  const fileInputRef = useRef(null)
  const [activeTopTab, setActiveTopTab] = useState("Chat");
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

const [documentMetadata, setDocumentMetadata] = useState(() => {
  return JSON.parse(localStorage.getItem("documentMetadata") || "{}");
});

const [tagSearch, setTagSearch] = useState("");
useEffect(() => {
  localStorage.setItem(
    "documentTags",
    JSON.stringify(documentTags)
  );
}, [documentTags]);

const [topicSearch, setTopicSearch] = useState("");
const [resumeMatchResult, setResumeMatchResult] = useState(null);

const [selectedDocumentDetails, setSelectedDocumentDetails] = useState(null)

const [relatedDocuments, setRelatedDocuments] = useState([]);

const [analysisTypeFilter, setAnalysisTypeFilter] = useState("all");

useEffect(() => {
  const handleEsc = (event) => {
    if (event.key === "Escape") {
      setSelectedDocumentDetails(null);
    }
  };

  window.addEventListener("keydown", handleEsc);

  return () => {
    window.removeEventListener("keydown", handleEsc);
  };
}, []);


useEffect(() => {
  localStorage.setItem(
    "documentMetadata",
    JSON.stringify(documentMetadata)
  );
}, [documentMetadata]);

  
useEffect(() => {
  localStorage.setItem("analysisHistory", JSON.stringify(analysisHistory));
}, [analysisHistory]);

const filteredDocuments = documents.filter((doc) => {
  const matchesCollection =
    selectedCollection === "All" ||
    (documentCollections[doc] || "Uncategorized") === selectedCollection;

  const matchesTag =
    tagSearch.trim() === "" ||
    (documentTags[doc] || "")
      .toLowerCase()
      .includes(tagSearch.toLowerCase());

  const matchesTopic =
    topicSearch.trim() === "" ||
    (documentMetadata[doc]?.topic || "")
      .toLowerCase()
      .includes(topicSearch.toLowerCase());

  return matchesCollection && matchesTag && matchesTopic;
});

function clearDocumentFilters() {
  setSelectedCollection("All");
  setTagSearch("");
  setTopicSearch("");
}

const hasActiveDocumentFilters =
  selectedCollection !== "All Collections" ||
  tagSearch.trim() !== "" ||
  topicSearch.trim() !== "";
  
  

const [categoryFilter, setCategoryFilter] = useState("All");
const [analysisSearchTerm, setAnalysisSearchTerm] = useState("");

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
	
	
	setDocumentMetadata((prev) => ({
		...prev,
		[selectedFile.name]: {
		uploadedAt: new Date().toLocaleDateString(),
		wordCount: data.word_count,
		summary: data.summary,
		topic: data.topic,
		characterCount: data.character_count,
		readingTime: data.reading_time_minutes,
		preview: data.preview,
		suggestedQuestions: data.suggested_questions,
		},
	}));
	if (data.keywords) {
		setDocumentTags((prev) => ({
		...prev,
		[selectedFile.name]: data.keywords,
		}));
	}
	
    fetchDocuments();
    setSelectedFile(null);
	if (fileInputRef.current) {
		fileInputRef.current.value = "";
	}
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

 

async function askAI(questionOverride = null, selectedDocumentsOverride = null) {
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

const documentsToUse = selectedDocumentsOverride || selectedDocuments;

  try {
    const response = await fetch("http://127.0.0.1:8000/ask-stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
	  question: questionToAsk,
	  selected_documents: documentsToUse,
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
			selected_documents: documentsToUse,
			chat_history: messages.slice(-10).map((message) => ({
				role: message.role,
				content: message.content,
			})),
		}),
	});

const sourcesData = await sourcesResponse.json();
console.log(sourcesData);
//setSources(sourcesData.sources || []);
// updateCurrentSessionSources(sourcesData.sources || []);
const finalMessages = [
  ...newMessages.slice(0, -1),
  {
    role: "assistant",
    content: streamedAnswer,
    sources: sourcesData.sources || [],
	rewrittenQuestion: sourcesData.rewritten_question,
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
 


function askAboutMetadataValue(key, value) {
    const label = key
        .replace(/_/g, " ")
        .replace(/\b\w/g, c => c.toUpperCase());

    let question = "";

    if (key.includes("warning")) {
        question = `What should I know about this warning?\n\n${value}`;
    } else if (key.includes("skill")) {
        question = `Why is this skill important in this document?\n\n${value}`;
    } else if (key.includes("technology")) {
        question = `Explain how this technology is used in this document.\n\n${value}`;
    } else if (key.includes("destination")) {
        question = `What should I know before visiting this destination?\n\n${value}`;
    } else if (key.includes("role")) {
        question = `Explain this role and why it matters in this document.\n\n${value}`;
    } else {
        question = `Explain this ${label}:\n\n${value}`;
    }

    setActiveTopTab("Chat");
    askAI(question);
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
	setAnalysisHistory((prev) => [
		{
			type: "summary",
			title: selectedDocument,
			content: data.summary,
			metadata: data.metadata,
			insights: data.insights,
			createdAt: new Date().toISOString(),
		},
		...prev,
	]);
	
	setAnalysisHistory((prev) => [
    {
        type: "summary",
        title: selectedDocument,
        content: data.summary,
        metadata: data.metadata,
        insights: data.insights,
        createdAt: new Date().toISOString(),
    },
    ...prev.filter(
        (item) =>
            !(
                item.type === "summary" &&
                item.title === selectedDocument
            )
    ),
	]);

    const summaryMessage = {
		role: "assistant",
		content: `📄 Summary of ${selectedDocument}\n\n${data.summary}`,
		sources: [],
		metadata: data.metadata,
		insights: data.insights,
	};

	updateCurrentSessionMessages([
		...messages,
		summaryMessage,
	]);
	setActiveTopTab("Chat");
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
		setAnalysisHistory((prev) => [
			{
				type: "compare",
				title: `${compareDocumentA} vs ${compareDocumentB}`,
				content: data.comparison,
				createdAt: new Date().toISOString(),
			},
			...prev,
		]);
		
		
		const userCompareMessage = {
			role: "user",
			content: `Compare ${compareDocumentA} and ${compareDocumentB}`,
			};

		const comparisonMessage = {
				role: "assistant",
				content: data.comparison,
				isComparison: true,
			};

		updateCurrentSessionMessages([
			...messages,
			userCompareMessage,
			comparisonMessage,
		]);

       
		setActiveTopTab("Chat");
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

function getRelatedDocuments(targetDoc) {
  const targetTags = (documentTags[targetDoc] || "")
    .toLowerCase()
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag !== "");

  const targetTopic = (
    documentMetadata[targetDoc]?.topic || ""
  ).toLowerCase();

  return documents
    .filter((doc) => doc !== targetDoc)
    .map((doc) => {
      const docTags = (documentTags[doc] || "")
        .toLowerCase()
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== "");

      const docTopic = (
        documentMetadata[doc]?.topic || ""
      ).toLowerCase();

      let score = 0;

      // shared tag score
      targetTags.forEach((tag) => {
        if (docTags.includes(tag)) {
          score += 2;
        }
      });

      // topic word score
      targetTopic.split(" ").forEach((word) => {
        if (
          word.length > 3 &&
          docTopic.includes(word)
        ) {
          score += 1;
        }
      });

      return {
			name: doc,
			score,
			percent: Math.min(score * 20, 100),
		};
    })
    .filter((doc) => doc.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}



async function analyzeResumeMatch() {
  setLoading(true);

  const userMessage = {
    role: "user",
    content: `Analyze resume match:\nResume: ${resumeDocument}\nJob Description: ${jobDescriptionDocument}`,
  };

  const assistantMessage = {
    role: "assistant",
    content: "Analyzing resume match...",
    sources: [],
  };

  const newMessages = [
    ...messages,
    userMessage,
    assistantMessage,
  ];

  updateCurrentSessionMessages(newMessages);

  updateCurrentSessionSelectedDocuments([
    resumeDocument,
    jobDescriptionDocument,
  ]);

  try {
    const response = await fetch("http://127.0.0.1:8000/resume-match", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resume_document: resumeDocument,
        job_description_document: jobDescriptionDocument,
      }),
    });

    const data = await response.json();
	setResumeMatchResult(data.answer);
	const finalMessages = [
		...newMessages.slice(0, -1),
	{
		role: "assistant",
		content: data.answer,
		sources: data.sources || []
		
	},
	];
	setAnalysisHistory((prev) => [
	{
		type: "resume-match",
		title: `${resumeDocument} vs ${jobDescriptionDocument}`,
		content: data.answer,
		createdAt: new Date().toISOString(),
	},
  ...prev,
	]);


    updateCurrentSessionMessages(finalMessages);
	setActiveTopTab("Chat");
  } catch (error) {
	  console.error("Error compare resume:", error);
    const errorMessages = [
      ...newMessages.slice(0, -1),
      {
        role: "assistant",
        content: "Error: Could not analyze resume match.",
        sources: [],
      },
    ];

    updateCurrentSessionMessages(errorMessages);
  } finally {
    setLoading(false);
  }
}

async function suggestTags(filename) {
  try {
    const response = await fetch(
      "http://127.0.0.1:8000/suggest-tags",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename,
        }),
      }
    );

    const data = await response.json();

    return data.tags || [];
  } catch (error) {
    console.error("Error suggesting tags:", error);
    return [];
  }
}

async function autoTagAllDocuments() {
  for (const doc of documents) {
    try {
      const tags = await suggestTags(doc);

      setDocumentTags((prev) => ({
        ...prev,
        [doc]: tags.join(", "),
      }));
    } catch (error) {
      console.error(`Failed to auto tag ${doc}:`, error);
    }
  }
}

function getSuggestedCollectionFromTags(tags) {
  const tagText = tags.toLowerCase();

  if (
    tagText.includes("resume") ||
    tagText.includes("career") ||
    tagText.includes("job") ||
    tagText.includes("interview")
  ) {
    return "Job Search";
  }

  if (
    tagText.includes("ai") ||
    tagText.includes("rag") ||
    tagText.includes("openai") ||
    tagText.includes("fastapi") ||
    tagText.includes("react")
  ) {
    return "AI Learning";
  }

  if (
    tagText.includes("travel") ||
    tagText.includes("hiking") ||
    tagText.includes("trail")
  ) {
    return "Travel";
  }

  return "Uncategorized";
}

function getAnalysisIcon(type) {
  if (type === "summary") return "📄";
  if (type === "compare") return "🔍";
  if (type === "resume-match") return "💼";
  return "📝";
}

const filteredAnalysisHistory = analysisHistory.filter((item) => {
  const matchesSearch =
    analysisSearchTerm.trim() === "" ||
    item.title?.toLowerCase().includes(analysisSearchTerm.toLowerCase()) ||
    item.content?.toLowerCase().includes(analysisSearchTerm.toLowerCase()) ||
    item.type?.toLowerCase().includes(analysisSearchTerm.toLowerCase());

  const matchesType =
    analysisTypeFilter === "all" || item.type === analysisTypeFilter;

  return matchesSearch && matchesType;
});

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
				 <span>{session.title}</span>

				{session.selectedDocuments?.length > 0 && (
					<span className="session-doc-count">
					{" "}
					({session.selectedDocuments.length} docs)
					</span>
				)}
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
	<div className="top-tabs">
		{["Documents", "Chat", "Analysis", "Career"].map((tab) => (
		<button
			key={tab}
  
			className={`top-tab ${activeTopTab === tab ? "active" : ""}`}
			onClick={() => setActiveTopTab(tab)}
		> {tab}
		</button>
		))}
	</div>
	<div className="tab-content">
		{activeTopTab === "Chat" && (
			<>
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
			{selectedDocuments.length > 0 && (
			<div className="selected-documents-bar">
				<strong>Selected documents:</strong>
				{selectedDocuments.map((doc) => (
				<span key={doc} className="selected-document-chip">
				{doc}
			</span>
			))}
		</div>
		)}


			<textarea
				value={question}
				onChange={(e) => setQuestion(e.target.value)}
				placeholder="Ask a question about the uploaded documents..."
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
 <>
 <ReactMarkdown
 components={{
  p: ({ children }) => <p>{children}</p>,
  li: ({ children }) => <li>{children}</li>,
}}
>
  {message.content || "_Thinking..._"}
   
</ReactMarkdown>

{message.metadata && (
    <div className="document-metadata">
        <h4>📋 Document Metadata</h4>

        {Object.entries(message.metadata)
    .filter(([_, value]) => {
        if (value === null || value === undefined) return false;
        if (value === "") return false;
        if (Array.isArray(value) && value.length === 0) return false;
        return true;
    })
    .map(([key, value]) => (
        <div key={key}>
            <strong>
                {key
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, c => c.toUpperCase())}
                :
            </strong>{" "}

            {Array.isArray(value) ? (
                <ul style={{
							marginTop: "4px",
							marginBottom: "8px",
							paddingLeft: "20px"
						}}>
                    {value.map((item, index) => (
                       <li key={index}>
							<button
							className="metadata-value-button"
							onClick={() => askAboutMetadataValue(key, item)}
							>
							{item}
							</button>
						</li>
                    ))}
                </ul>
            ) : (
                String(value)
            )}
        </div>
    ))}
	</div>
	)}
	
	{message.insights && (
    <div className="document-insights">
        <h4>💡 AI Insights</h4>

        <ReactMarkdown
            components={{
                p: ({ children }) => <p>{children}</p>,
                li: ({ children }) => <li>{children}</li>,
            }}
        >
            {message.insights}
        </ReactMarkdown>
    </div>
)}

</>

) : (
  <div>
    {highlightText(message.content, messageSearchTerm)}
  </div>
)}

{(message.rewrittenQuestion || message.rewritten_question) && (
  <div className="rewritten-question">
    🔄 Search Query: {message.rewrittenQuestion || message.rewritten_question}
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
				{source.chunk_count && (
			<span> — {source.chunk_count} chunk(s) used</span>
			)}
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
      </>
  )}
		{activeTopTab === "Documents" && (
		
		<>
    <h2>Documents</h2>
		<div className="upload-box">
			<h2>Upload Document</h2>

			<input
				type="file"
				accept=".txt,.pdf,.docx"
				ref={fileInputRef}
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
				{hasActiveDocumentFilters && (
				<p>
					Active Filters:
					{selectedCollection !== "All Collections" &&
					` Collection = ${selectedCollection}`}
					{tagSearch &&
					` | Tag = ${tagSearch}`}
					{topicSearch &&
					` | Topic = ${topicSearch}`}
				</p>
				)}
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
		
			<div className="topic-filter">
				<label>Topic Search: </label>

				<input
					type="text"
				value={topicSearch}
				onChange={(e) => setTopicSearch(e.target.value)}
				placeholder="Search AI topics..."
				/>
				<button onClick={clearDocumentFilters}>
					Clear Filters
				</button>
			</div>
		
			<div className="document-selection-actions">
				<button
					onClick={() => {
					updateCurrentSessionSelectedDocuments(filteredDocuments);
					}}
					disabled={filteredDocuments.length === 0}
				>
					Select All
				</button>

				<button
					onClick={() => {
					updateCurrentSessionSelectedDocuments([]);
					}}
					disabled={selectedDocuments.length === 0}
				>
					Select None
				</button>
				<button onClick={autoTagAllDocuments}>
					Auto Tag All
				</button>
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

				{filteredDocuments.map((doc) => (
					<option key={doc} value={doc}>
					{doc}
					</option>
				))}
			
			</select>
			
			<p className="selected-documents-count">
						{selectedDocuments.length === 0
						? "No documents selected (searching all documents)"
						: `${selectedDocuments.length} document(s) selected`}
			</p>
			
			

			
			


			
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
					📄 
					<span
					style={{
					cursor: "pointer",
					textDecoration: "underline",
						}}
   
	
						onClick={() => {
						setSelectedDocumentDetails({
						name: doc,
						category: documentCollections[doc],
						tags: documentTags[doc],
						metadata: documentMetadata[doc],
						});

					setRelatedDocuments(getRelatedDocuments(doc));
					}}
					>
						{doc}
					</span>
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
						onClick={async () => {
						const tags = await suggestTags(doc);

						const tagText = tags.join(", ");

						setDocumentTags((prev) => ({
						...prev,
						[doc]: tagText,
						}));

						const suggestedCollection =
						getSuggestedCollectionFromTags(tagText);

						setDocumentCollections((prev) => ({
							...prev,
							[doc]: suggestedCollection,
						}));
						}}
						style={{ marginLeft: "10px" }}
					>
						Auto Tag
					</button>


						<span style={{ marginLeft: "10px" }}>
							Uploaded: {documentMetadata[doc]?.uploadedAt || "Unknown"}
							<br />
								Words: {documentMetadata[doc]?.wordCount || 0}

							<br />
							Reading: {documentMetadata[doc]?.readingTime || 0} min
  
						</span>

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
    </>
)}
	
	{activeTopTab === "Analysis" && (
	<div className="tab-placeholder">
		<h2>Analysis</h2>
		<h3>Document Summary</h3>
			<select
				value={selectedDocument}
				onChange={(e) => updateCurrentSessionSelectedDocument(e.target.value)}
			>
				<option value="all">Select document to summarize</option>

				{documents.map((doc) => (
					<option key={doc} value={doc}>
					{doc}
				</option>
			))}
			</select>
		<button
			onClick={summarizeDocument}
			disabled={selectedDocument === "all"}
		>
			📄 Summarize Document
		</button>

		
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
			<div className="analysis-history-header">
					
					<h2>Analysis History ({filteredAnalysisHistory.length})</h2>
					<button
					className="clear-history-button"
						onClick={() => {
						if (window.confirm("Clear Analysis History?")) {
						setAnalysisHistory([]);
					}
					}}
				>
				🗑 Clear
				</button>
				<div className="analysis-filter-buttons">
					 <button
						className={analysisTypeFilter === "all" ? "analysis-filter-active" : ""}
						onClick={() => setAnalysisTypeFilter("all")}
					>
						All
					</button>
					 <button
						className={analysisTypeFilter === "summary" ? "analysis-filter-active" : ""}
						onClick={() => setAnalysisTypeFilter("summary")}
					>
						Summary
					</button>
					<button
						className={analysisTypeFilter === "compare" ? "analysis-filter-active" : ""}
						onClick={() => setAnalysisTypeFilter("compare")}
					>
						Compare
					</button>
					<button
						className={analysisTypeFilter === "resume-match" ? "analysis-filter-active" : ""}
						onClick={() => setAnalysisTypeFilter("resume-match")}
					>
						Resume Match
					</button>
				</div>
			</div>
			
			{filteredAnalysisHistory.length === 0 ? (
				<p className="empty-analysis">
					No analysis history yet.
				<br />
					{analysisTypeFilter === "summary"
					? "Document summaries will appear here."
					: analysisTypeFilter === "compare"
					? "Document comparisons will appear here."
					: analysisTypeFilter === "resume-match"
					? "Resume match analyses will appear here."
					: "Summaries, comparisons, and resume matches will appear here."}
				</p>
			) : (
				filteredAnalysisHistory.map((item, index) => (
			<div
				key={index}
				className={`analysis-history-item analysis-${item.type || "general"}`}
				onClick={() => {
					const alreadyInChat = messages.some(
					(message) =>
					message.content?.includes(item.content) ||
					message.content?.includes(item.title)
				);

					if (!alreadyInChat) {
						const historyMessage = {
						role: "assistant",
						content:
						`${item.type === "summary" ? "📄 Summary" : "🔍 Compare"}: ${item.title}\n\n${item.content}`,
						isHistory: true,
					};

				updateCurrentSessionMessages([
				...messages,
				historyMessage,
				]);
				}

				setActiveTopTab("Chat");
		}}
			>
			<div className="analysis-history-card-header">
				<span className="analysis-history-icon">
				{getAnalysisIcon(item.type)}
				</span>

				<div>
					<strong>{item.type === "summary" ? "Summary" : item.type === "resume-match" ? "Resume Match" : "Compare"}</strong>
					<p>{item.title}</p>
					<small>{new Date(item.createdAt).toLocaleString()}</small>
					 <p className="analysis-history-preview">
						{item.content
							? item.content
							.replace(/^#+\s*/gm, "")   // Remove Markdown headings like "#", "##"
							.replace(/\n/g, " ")       // Replace newlines with spaces
								.slice(0, 160) + "..."
							: "No preview available."}
					</p>
				</div>
			</div>
			
			
			</div>
			))
		)}
	</div>
	)}

	


{activeTopTab === "Career" && (
  <div className="tab-placeholder">
    <h2>Career</h2>
	
			<div className="career-assistant-box">
				<h3>Resume</h3>

				<select
					value={resumeDocument}
					onChange={(e) => setResumeDocument(e.target.value)}
				>
					<option value="">Select Resume</option>

				{documents.map((doc) => (
					<option key={doc} value={doc}>
					{doc}
					</option>
				))}
				</select>

				<h3>Job Description</h3>

				<select
						value={jobDescriptionDocument}
						onChange={(e) => setJobDescriptionDocument(e.target.value)}
				>
						<option value="">Select Job Description</option>

						{documents.map((doc) => (
							<option key={doc} value={doc}>
						{doc}
							</option>
						))}
				</select>
				<button
					onClick={analyzeResumeMatch}
					disabled={!resumeDocument || !jobDescriptionDocument}
				>
					Analyze Match
				</button>
				
			</div>
	
	
  </div>
)}

		
	</div>
	</main>
	
	{selectedDocumentDetails && (
  <div className="document-modal"  onClick={() => setSelectedDocumentDetails(null)}>
    <div className="document-modal-content" onClick={(e) => e.stopPropagation()}>
      <h3>{selectedDocumentDetails.name}</h3>

      <p>
        <strong>Category:</strong>{" "}
        {selectedDocumentDetails.category || "Uncategorized"}
      </p>
	<p>
		<strong>AI Topic:</strong>{" "}
		{selectedDocumentDetails.metadata?.topic || "Unknown"}
	</p>
      <p>
        <strong>Tags:</strong>{" "}
        {selectedDocumentDetails.tags || "No tags"}
      </p>

      <p>
        <strong>Uploaded:</strong>{" "}
        {selectedDocumentDetails.metadata?.uploadedAt || "Unknown"}
      </p>

      <div className="document-insights">
		<div className="insight-card">
		📄 {selectedDocumentDetails.metadata?.wordCount || 0} Words
		</div>

		<div className="insight-card">
			🔤 {selectedDocumentDetails.metadata?.characterCount || 0} Characters
		</div>

		<div className="insight-card">
			⏱ {selectedDocumentDetails.metadata?.readingTime || 0} Min Read
		</div>
</div>
	<div className="document-preview">
		<strong>Preview:</strong>
		<p>
		{selectedDocumentDetails.metadata?.preview ||
		"No preview available."}
		</p>
	</div>
	<div className="document-summary">
		<strong>AI Summary:</strong>
		<p>
			{selectedDocumentDetails.metadata?.summary ||
			"No summary available."}
		</p>
	</div>
	<div className="suggested-questions">
			<strong>Suggested Questions:</strong>

			{selectedDocumentDetails.metadata?.suggestedQuestions ? (
		<ul>
			{selectedDocumentDetails.metadata.suggestedQuestions
				.split("\n")
			.map((question) => question.trim())
			.filter((question) => question !== "")
			.map((question, index) => (
			<li
				key={index}
				className="suggested-question"
				onClick={() => {
				const selectedName = selectedDocumentDetails.name;

updateCurrentSessionSelectedDocuments([selectedName]);
setQuestion(question);
setSelectedDocumentDetails(null);

setTimeout(() => {
  askAI(question, [selectedName]);
}, 100);
				}}
			>
				{question}
			</li>
			))}
		</ul>
		) : (
		<p>No suggested questions available.</p>
		)}
	</div>
	
	<div className="related-documents">
			<strong>Related Documents:</strong>

			{relatedDocuments.length === 0 ? (
				<p>No related documents found.</p>
			) : (
			<ul>
				{relatedDocuments.map((relatedDoc) => (
					<li
						key={relatedDoc.name}
						style={{
						cursor: "pointer",
						textDecoration: "underline",
					}}
					onClick={() => {
					setSelectedDocumentDetails({
					name: relatedDoc.name,
					category: documentCollections[relatedDoc.name],
					tags: documentTags[relatedDoc.name],
					metadata: documentMetadata[relatedDoc.name],
					});

					setRelatedDocuments(
					getRelatedDocuments(relatedDoc.name)
					);
					}}
					>
				{relatedDoc.name} — {relatedDoc.percent}% Match
				</li>
			))}
			</ul>
		)}
	</div>
      <button onClick={() => setSelectedDocumentDetails(null)}>
        Close
      </button>
    </div>
  </div>
)}
	
</div>
 );
}

export default App;