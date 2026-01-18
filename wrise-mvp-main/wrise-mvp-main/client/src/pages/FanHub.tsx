/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { MessageSquare, Brain, Send, User } from "lucide-react";
import { toast } from "@/components/ui/sonner";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
  isLocked?: boolean;
}

interface ChatHistoryItem {
  id: string;
  title: string;
  lastUpdated: Date;
  messages: Message[];
}

const FanHub = () => {
  const { user } = useAuth();
  const { creatorId } = useParams();

  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [questionsRemaining, setQuestionsRemaining] = useState(2);
  const [showSubscribe, setShowSubscribe] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (chatHistory.length === 0) {
      const initialChat: ChatHistoryItem = {
        id: "1",
        title: "Welcome Chat",
        lastUpdated: new Date(),
        messages: [
          {
            id: 1,
            text: "Hi! I'm trained on everything I've ever posted. Ask me anything about content creation, productivity, or entrepreneurship!",
            isBot: true,
            timestamp: new Date(),
          },
        ],
      };
      setChatHistory([initialChat]);
      setSelectedChatId(initialChat.id);
      setMessages(initialChat.messages);
    }
  }, []);

  const handleSelectChat = (chatId: string) => {
    const chat = chatHistory.find((c) => c.id === chatId);
    if (chat) {
      setSelectedChatId(chatId);
      setMessages(chat.messages);
    }
  };

  const handleSubscribe = async () => {
    try {
      const fanId = user?.id;
      if (!fanId || !creatorId) {
        toast.error("Please log in");
        return;
      }
      const amountCents = 799; // TODO: replace with creator-configured price
      const res = await fetch("https://clonark.onrender.com/api/fan/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fanId, creatorId, amountCents, accessType: "subscription" }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Failed to start checkout");
      }
    } catch (e) {
      toast.error("Failed to start checkout");
    }
  };

  const updateChatHistoryMessages = (chatId: string, newMessages: Message[]) => {
    setChatHistory((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? { ...chat, messages: newMessages, lastUpdated: new Date() }
          : chat
      )
    );
  };

  const addMessageToCurrentChat = (newMessage: Message) => {
    if (!selectedChatId) return;

    setMessages((prevMessages) => {
      const updatedMessages = [...prevMessages, newMessage];
      updateChatHistoryMessages(selectedChatId, updatedMessages);
      return updatedMessages;
    });
  };


  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: question,
      isBot: false,
      timestamp: new Date(),
    };
    addMessageToCurrentChat(userMessage);
    setQuestion("");
    setIsTyping(true);

    try {
      const response = await fetch("https://clonark.onrender.com/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(user?.id ? { "x-user-id": user.id } : {}),
        },
        body: JSON.stringify({ question, creatorId }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(`Error: ${error?.error || "Unknown error"}`);
        setIsTyping(false);
        return;
      }

      const data = await response.json();
      let botMessage: Message;

      if (isSubscribed || questionsRemaining > 0) {
        botMessage = {
          id: messages.length + 1,
          text: data.answer,
          isBot: true,
          timestamp: new Date(),
        };

        if (!isSubscribed) {
          setQuestionsRemaining((prev) => prev - 1);
          toast.success(`Answered! You have ${questionsRemaining - 1} free questions left.`);
        }
      } else {
        botMessage = {
          id: messages.length + 2,
          text: "🔒 You've reached your free question limit. Subscribe for unlimited answers!",
          isBot: true,
          timestamp: new Date(),
          isLocked: true,
        };
        setShowSubscribe(true);
      }

      addMessageToCurrentChat(botMessage);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to get a response from the server.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleNewChat = () => {
    const newId = Date.now().toString(); // unique enough for this purpose
    const newChat: ChatHistoryItem = {
      id: newId,
      title: `Chat ${chatHistory.length + 1}`,
      lastUpdated: new Date(),
      messages: [
        {
          id: 1,
          text: "Hi! What would you like to talk about?",
          isBot: true,
          timestamp: new Date(),
        },
      ],
    };
    setChatHistory((prev) => [newChat, ...prev]);
    setSelectedChatId(newId);
    setMessages(newChat.messages);
  };


  return (
    <div className="flex flex-col h-screen bg-[#f7f7f8]">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex items-center gap-3">
        {/* Logo */}
        <div className="relative w-10 h-10 bg-gradient-to-br from-orange-500 via-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-orange-400/20 animate-pulse"></div>
          <img 
            src="/lovable-uploads/2878a6ab-b998-45c6-ad2d-8d7be6f88feb.png" 
            alt="Clonark Logo" 
            className="w-6 h-6 object-contain filter invert transition-all duration-300 group-hover:scale-110 group-hover:rotate-12"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold text-black">
          Clonark
        </h1>
      </header>

      {/* Body layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-medium text-gray-500">Chat History</h2>
            <button
              onClick={handleNewChat}
              className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 rounded-md"
            >
              + New
            </button>
          </div>
          <ul className="space-y-3">
            {chatHistory
              .sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime())
              .map((chat) => (
                <li
                  key={chat.id}
                  onClick={() => handleSelectChat(chat.id)}
                  className={`p-3 rounded-lg cursor-pointer ${
                    selectedChatId === chat.id ? "bg-orange-100" : "hover:bg-gray-100"
                  }`}
                >
                  <div className="font-medium text-sm text-gray-800">{chat.title}</div>
                  <div className="text-xs text-gray-400">
                    {chat.lastUpdated.toLocaleString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "numeric",
                      month: "short",
                    })}
                  </div>
                </li>
              ))}
          </ul>
        </aside>

        {/* Chat Area */}
        <main className="flex flex-col flex-1 overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}
              >
                <div className="flex gap-2 items-start max-w-[80%]">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-400 text-white text-sm">
                    {msg.isBot ? <Brain className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div>
                    <div
                      className={`px-4 py-3 rounded-xl text-sm whitespace-pre-line shadow-sm ${
                        msg.isBot
                          ? "bg-[#ececf1] text-gray-800 text-left"
                          : "bg-orange-500 text-white text-right"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <div className="text-xs text-gray-400 mt-1 text-right">
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 items-start">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-400 text-white">
                  <Brain className="w-4 h-4" />
                </div>
                <div className="px-4 py-2 rounded-xl bg-[#ececf1] flex space-x-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150" />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-300" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleQuestionSubmit}
            className="bg-white p-4 border-t border-gray-200"
          >
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none text-sm shadow-sm bg-white"
                  placeholder="Send a message..."
                />
              </div>
              <Button
                type="submit"
                disabled={!question.trim()}
                className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 transition"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
          {showSubscribe && (
            <div className="bg-white border-t border-gray-200 p-4 flex items-center justify-between">
              <span className="text-sm text-gray-700">Unlock full access to this creator's chatbot.</span>
              <Button onClick={handleSubscribe} className="bg-orange-500 hover:bg-orange-600 text-white">
                Subscribe
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default FanHub;

