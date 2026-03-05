import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, BookOpen, Quote, Plus, MessageSquare } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import { SharedContentModal } from '../components/SharedContentModal';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    citedNotes?: any[];
}

interface ChatHistoryItem {
    id: string;
    title: string;
    updatedAt: string;
    preview: string;
}

export function AIAssistantPage() {
    const { getToken } = useAuth();
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Hello! I'm your Second Brain AI. Ask me anything about your notes!" }
    ]);
    const [history, setHistory] = useState<ChatHistoryItem[]>([]);
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [selectedCitedNote, setSelectedCitedNote] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchHistory = async () => {
        try {
            const token = await getToken();
            const response = await axios.get('http://localhost:3000/api/v1/chat/history', {
                headers: { "authorization": `Bearer ${token}` }
            });
            if (response.data.success) {
                setHistory(response.data.history);
            }
        } catch (error) {
            console.error("Failed to fetch chat history", error);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const loadConversation = async (id: string) => {
        try {
            const token = await getToken();
            const response = await axios.get(`http://localhost:3000/api/v1/chat/conversation/${id}`, {
                headers: { "authorization": `Bearer ${token}` }
            });
            if (response.data.success) {
                setConversationId(id);
                setMessages(response.data.conversation.messages);
            }
        } catch (error) {
            console.error("Failed to load conversation", error);
        }
    };

    const startNewChat = () => {
        setConversationId(null);
        setMessages([{ role: 'assistant', content: "Hello! I'm your Second Brain AI. Ask me anything about your notes!" }]);
    };

    const handleSendMessage = async () => {
        if (!input.trim() || isSending) return;

        const userQuery = input;
        setInput('');
        setIsSending(true);

        // Optimistic UI update
        const newUserMessage: Message = { role: 'user', content: userQuery };
        setMessages(prev => [...prev, newUserMessage]);

        try {
            const token = await getToken();
            const response = await axios.post('http://localhost:3000/api/v1/chat/chat-with-notes', {
                query: userQuery,
                conversationId: conversationId
            }, {
                headers: { "authorization": `Bearer ${token}` }
            });

            if (response.data.success) {
                const assistantMessage: Message = {
                    role: 'assistant',
                    content: response.data.answer,
                    citedNotes: response.data.citedNotes
                };
                setMessages(prev => [...prev, assistantMessage]);
                setConversationId(response.data.conversationId);
                fetchHistory();
            }
        } catch (error) {
            console.error("Failed to send message:", error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error processing your request." }]);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden">
            {/* Sidebar (History) */}
            <div className="w-64 lg:w-72 border-r border-border hidden md:flex flex-col bg-muted/10 p-4 flex-shrink-0">
                <button
                    onClick={startNewChat}
                    className="flex items-center gap-2 justify-center w-full py-3 px-4 rounded-2xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 mb-6"
                >
                    <Plus size={18} />
                    New Chat
                </button>

                <div className="flex items-center gap-2 mb-4 px-2 text-muted-foreground">
                    <MessageSquare size={16} />
                    <span className="text-sm font-bold uppercase tracking-wider">History</span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                    {history.length === 0 ? (
                        <div className="text-sm text-muted-foreground text-center mt-4">No recent chats</div>
                    ) : (
                        history.map((conv) => (
                            <button
                                key={conv.id}
                                onClick={() => loadConversation(conv.id)}
                                className={`w-full text-left p-3 rounded-2xl transition-all border ${conversationId === conv.id
                                    ? 'bg-primary/10 border-primary/20 shadow-sm'
                                    : 'bg-card border-transparent hover:bg-muted hover:border-border'
                                    }`}
                            >
                                <div className={`font-bold text-sm truncate ${conversationId === conv.id ? 'text-primary' : 'text-foreground'}`}>
                                    {conv.title}
                                </div>
                                <div className="text-xs text-muted-foreground truncate mt-1">
                                    {conv.preview}
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col p-4 sm:p-6 w-full relative min-w-0 min-h-0 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center border border-border shadow-sm">
                            <Sparkles className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-foreground">AI Assistant</h1>
                            <p className="text-muted-foreground text-xs sm:text-sm">Ask about your notes and ideas.</p>
                        </div>
                    </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 min-h-0 overflow-y-auto bg-card rounded-3xl border border-border shadow-sm p-4 sm:p-6 space-y-6 custom-scrollbar scroll-smooth mb-6">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold shadow-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted border border-border text-muted-foreground'}`}>
                                {msg.role === 'user' ? 'ME' : 'AI'}
                            </div>
                            <div className="space-y-4 max-w-[85%]">
                                <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-secondary text-secondary-foreground rounded-tl-sm border border-border'}`}>
                                    {msg.role === 'assistant' ? (
                                        <div className="prose prose-sm dark:prose-invert max-w-none break-words overflow-x-auto w-full">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkMath]}
                                                rehypePlugins={[rehypeKatex]}
                                            >
                                                {msg.content}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        msg.content
                                    )}
                                </div>

                                {/* Cited Sources */}
                                {msg.role === 'assistant' && msg.citedNotes && msg.citedNotes.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-1 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                        <div className="w-full flex items-center gap-2 mb-1 px-1">
                                            <Quote size={12} className="text-primary/50" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Sources</span>
                                        </div>
                                        {msg.citedNotes.map((note, nIdx) => (
                                            <button
                                                key={nIdx}
                                                onClick={() => {
                                                    setSelectedCitedNote(note);
                                                    setIsModalOpen(true);
                                                }}
                                                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-md transition-all text-left max-w-[200px] group"
                                            >
                                                <BookOpen size={14} className="text-primary group-hover:scale-110 transition-transform" />
                                                <span className="text-xs font-medium text-foreground truncate">{note.title}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isSending && (
                        <div className="flex gap-4 animate-pulse">
                            <div className="w-8 h-8 rounded-full bg-muted border border-border" />
                            <div className="bg-secondary/50 p-4 rounded-2xl rounded-tl-sm border border-border w-1/2 h-12" />
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="relative flex-none mt-auto">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Ask your second brain..."
                        className="w-full pl-5 pr-32 py-4 rounded-2xl bg-card border border-border text-foreground shadow-lg shadow-black/[0.03] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/60"
                    />

                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        {input.trim() && (
                            <div className="text-[10px] font-bold text-muted-foreground/50 mr-2 hidden sm:block uppercase tracking-tighter">
                                Press Enter
                            </div>
                        )}
                        <button
                            onClick={handleSendMessage}
                            disabled={!input.trim() || isSending}
                            className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${!input.trim() || isSending
                                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 active:scale-95 shadow-lg shadow-primary/20'
                                }`}
                        >
                            <Send size={18} className={isSending ? 'animate-pulse' : ''} />
                        </button>
                    </div>
                </div>

                {/* Cited Note Modal */}
                <SharedContentModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    content={selectedCitedNote}
                    canFork={false}
                    shareToken={undefined}
                />
            </div>
        </div>
    );
}
