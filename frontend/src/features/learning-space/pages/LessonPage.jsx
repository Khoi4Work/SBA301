import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    BookOpen, Volume2, VolumeX, CheckCircle2, XCircle,
    ChevronRight, ChevronLeft, Trophy, RotateCcw,
    Loader2, ArrowLeft, Pause, Play, AlertTriangle, Pencil
} from 'lucide-react';
import { fetchLessonContent, generateQuiz, speakText } from '@/services/sessionService.js';
import apiClient from '@/services/apiClient.js';
import '@/assets/styles/philoverse-study.css';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const CHUNK_SIZE = 1800; // ký tự mỗi chunk TTS
const STAGES = { READING: 'reading', QUIZ: 'quiz', RESULT: 'result' };

// ─── READING STAGE ────────────────────────────────────────────────────────────
function ReadingStage({ lesson, s3Key, onComplete }) {
    const [audioChunks, setAudioChunks] = useState([]);
    const [currentChunk, setCurrentChunk] = useState(0);
    const [isLoadingAudio, setIsLoadingAudio] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioError, setAudioError] = useState(null);
    const [ttsStarted, setTtsStarted] = useState(false);
    const audioRef = useRef(null);

    // Notes and selection states
    const [notes, setNotes] = useState([]);
    const [showSelectionMenu, setShowSelectionMenu] = useState(false);
    const [selectionCoords, setSelectionCoords] = useState({ top: 0, left: 0 });
    const [selectedText, setSelectedText] = useState('');
    const [showNoteForm, setShowNoteForm] = useState(false);
    const [noteText, setNoteText] = useState('');
    const [editingNote, setEditingNote] = useState(null);

    // AI Chat states
    const [activeTab, setActiveTab] = useState('notes');
    const [philosophers, setPhilosophers] = useState([]);
    const [selectedPhilosopherId, setSelectedPhilosopherId] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatHighlightContext, setChatHighlightContext] = useState('');
    const [chatInput, setChatInput] = useState('');
    const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
    const [chatSessionId, setChatSessionId] = useState(null);
    const chatInputRef = useRef(null);
    const chatEndRef = useRef(null);

    // Chia text thành chunks
    const chunks = [];
    const content = lesson?.content ?? '';
    for (let i = 0; i < content.length; i += CHUNK_SIZE) {
        chunks.push(content.slice(i, i + CHUNK_SIZE));
    }

    const loadChunk = useCallback(async (index) => {
        if (index >= chunks.length) return;
        if (audioChunks[index]) return; // đã load rồi

        setIsLoadingAudio(true);
        setAudioError(null);
        try {
            const base64 = await speakText(chunks[index]);
            setAudioChunks(prev => {
                const updated = [...prev];
                updated[index] = base64;
                return updated;
            });
        } catch (e) {
            setAudioError('Không thể tạo âm thanh. Vui lòng thử lại.');
        } finally {
            setIsLoadingAudio(false);
        }
    }, [chunks, audioChunks]);

    const handleStartAudio = async () => {
        setTtsStarted(true);
        setCurrentChunk(0);
        await loadChunk(0);
    };

    useEffect(() => {
        if (!ttsStarted) return;
        const base64 = audioChunks[currentChunk];
        if (!base64 || !audioRef.current) return;

        audioRef.current.src = `data:audio/mpeg;base64,${base64}`;
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});

        // Preload chunk tiếp theo
        if (currentChunk + 1 < chunks.length) {
            loadChunk(currentChunk + 1);
        }
    }, [audioChunks[currentChunk], ttsStarted]);

    const handleAudioEnded = async () => {
        setIsPlaying(false);
        const next = currentChunk + 1;
        if (next < chunks.length) {
            setCurrentChunk(next);
            if (!audioChunks[next]) {
                await loadChunk(next);
            }
        }
    };

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        }
    };

    const progressPct = content.length > 0
        ? Math.round(((currentChunk + 1) / Math.max(chunks.length, 1)) * 100)
        : 0;

    // Load notes for document
    const fetchNotes = useCallback(async () => {
        try {
            const res = await apiClient.get(`/notes?s3Key=${encodeURIComponent(s3Key)}`);
            setNotes(res.data?.result || []);
        } catch (err) {
            console.error("Failed to load notes:", err);
        }
    }, [s3Key]);

    useEffect(() => {
        if (s3Key) {
            fetchNotes();
        }
    }, [s3Key, fetchNotes]);

    // Fetch philosophers list
    useEffect(() => {
        const loadPhilosophers = async () => {
            try {
                const res = await apiClient.get('/philosophers/');
                const list = res.data?.result || [];
                setPhilosophers(list);
                if (list.length > 0) {
                    setSelectedPhilosopherId(list[0].id);
                }
            } catch (err) {
                console.error("Failed to fetch philosophers:", err);
            }
        };
        loadPhilosophers();
    }, []);

    // Load active session and chat history when philosopher selection changes
    useEffect(() => {
        if (!selectedPhilosopherId) return;

        const loadSessionAndHistory = async () => {
            try {
                const res = await apiClient.get(`/chat-sessions?philosopherId=${selectedPhilosopherId}`);
                const sessions = res.data?.result || [];
                if (sessions.length > 0) {
                    const latestSession = sessions[0];
                    setChatSessionId(latestSession.sessionId);
                    const histRes = await apiClient.get(`/chat-history/session/${latestSession.sessionId}`);
                    const history = histRes.data?.result || [];
                    const msgs = [];
                    history.forEach(h => {
                        msgs.push({ role: 'user', content: h.query });
                        msgs.push({ role: 'assistant', content: h.response });
                    });
                    setChatMessages(msgs);
                } else {
                    setChatSessionId(null);
                    setChatMessages([]);
                }
            } catch (err) {
                console.error("Failed to load session/history:", err);
                setChatSessionId(null);
                setChatMessages([]);
            }
        };

        loadSessionAndHistory();
    }, [selectedPhilosopherId]);

    // Auto-scroll chat window to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages, isGeneratingResponse]);

    // Handle text selection
    const handleTextSelection = (e) => {
        const selection = window.getSelection();
        const text = selection.toString().trim();
        if (text.length > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            const container = e.currentTarget.getBoundingClientRect();

            setSelectionCoords({
                top: rect.top - container.top + e.currentTarget.scrollTop - 40,
                left: rect.left - container.left + rect.width / 2
            });
            setSelectedText(text);
            setShowSelectionMenu(true);
        } else {
            setShowSelectionMenu(false);
        }
    };

    const handleCreateNoteClick = () => {
        setEditingNote(null);
        setNoteText('');
        setShowNoteForm(true);
        setShowSelectionMenu(false);
        window.getSelection()?.removeAllRanges();
    };

    const handleStartAiChatClick = () => {
        setActiveTab('chat');
        setChatHighlightContext(selectedText);
        setShowSelectionMenu(false);
        window.getSelection()?.removeAllRanges();
        setTimeout(() => {
            chatInputRef.current?.focus();
        }, 100);
    };

    const handleSendChatMessage = async () => {
        if (!chatInput.trim() || isGeneratingResponse || !selectedPhilosopherId) return;

        const query = chatInput.trim();
        setChatInput('');

        // Add user message locally
        const userMsg = { role: 'user', content: query };
        setChatMessages(prev => [...prev, userMsg]);
        setIsGeneratingResponse(true);

        try {
            // Build query params
            const params = new URLSearchParams();
            params.append('query', query);
            if (s3Key) {
                params.append('s3Key', s3Key);
            }
            if (chatHighlightContext) {
                params.append('selectedText', chatHighlightContext);
            }
            if (selectedPhilosopherId) {
                params.append('philosopherId', selectedPhilosopherId);
            }
            if (chatSessionId) {
                params.append('sessionId', chatSessionId);
            }

            const res = await apiClient.get(`/rag/ask-contextual?${params.toString()}`);
            const data = res.data?.result;
            
            if (data) {
                if (!chatSessionId && data.sessionId) {
                    setChatSessionId(data.sessionId);
                }
                setChatMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
            }
            setChatHighlightContext('');
        } catch (err) {
            console.error("Failed to fetch AI response:", err);
            setChatMessages(prev => [...prev, { role: 'assistant', content: "Có lỗi xảy ra khi luận đàm với Triết gia AI. Vui lòng thử lại sau." }]);
        } finally {
            setIsGeneratingResponse(false);
        }
    };

    const handleSaveNote = async () => {
        try {
            if (editingNote) {
                await apiClient.put(`/notes/${editingNote.noteId}`, {
                    documentS3Key: s3Key,
                    selectedText: selectedText,
                    noteText: noteText
                });
            } else {
                await apiClient.post('/notes', {
                    documentS3Key: s3Key,
                    selectedText: selectedText,
                    noteText: noteText
                });
            }
            setShowNoteForm(false);
            setEditingNote(null);
            setNoteText('');
            fetchNotes();
        } catch (err) {
            console.error("Failed to save note:", err);
        }
    };

    const handleDeleteNote = async (noteId) => {
        try {
            await apiClient.delete(`/notes/${noteId}`);
            fetchNotes();
        } catch (err) {
            console.error("Failed to delete note:", err);
        }
    };

    const handleEditNoteClick = (note) => {
        setEditingNote(note);
        setSelectedText(note.selectedText || '');
        setNoteText(note.noteText || '');
        setShowNoteForm(true);
    };

    // Render HTML content with highlights
    const renderParagraph = (para, idx) => {
        let escaped = para.trim()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        notes.forEach(note => {
            if (note.selectedText && escaped.includes(note.selectedText)) {
                const highlighted = `<span class="bg-yellow-500/20 border-b border-yellow-500 cursor-pointer hover:bg-yellow-500/35 transition-colors relative group" title="${note.noteText}">${note.selectedText}</span>`;
                escaped = escaped.replaceAll(note.selectedText, highlighted);
            }
        });

        return (
            <p
                key={idx}
                className="font-body text-base leading-relaxed text-on-surface-variant text-justify whitespace-pre-line"
                style={{ textAlign: 'justify' }}
                dangerouslySetInnerHTML={{ __html: escaped }}
            />
        );
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full overflow-hidden">
            {/* Content Panel */}
            <div className="lg:col-span-2 flex flex-col h-full overflow-hidden">
                <div className="bg-surface-container-low border border-outline-variant/20 rounded-lg overflow-hidden flex flex-col h-full">
                    <div className="px-8 py-5 border-b border-outline-variant/20 flex items-center gap-3">
                        <BookOpen size={18} className="text-secondary" />
                        <span className="text-sm font-bold tracking-wider uppercase text-secondary">
                            Nội dung bài học
                        </span>
                    </div>
                    <div 
                        className="p-8 flex-1 overflow-y-auto custom-scrollbar relative"
                        onMouseUp={handleTextSelection}
                    >
                        <div className="prose prose-invert max-w-none space-y-4">
                            {content ? (
                                content.split(/\n\s*\n/).map((para, idx) => renderParagraph(para, idx))
                            ) : (
                                <p className="text-on-surface-variant italic">Không có nội dung.</p>
                            )}
                        </div>

                        {/* Floating Selection Menu */}
                        {showSelectionMenu && (
                            <div
                                className="absolute z-50 bg-surface-container-high border border-outline-variant/30 p-1.5 rounded-lg shadow-xl flex items-center gap-2"
                                style={{
                                    top: `${selectionCoords.top}px`,
                                    left: `${selectionCoords.left}px`,
                                    transform: 'translateX(-50%)'
                                }}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                                onMouseUp={(e) => {
                                    e.stopPropagation();
                                }}
                            >
                                <button
                                    onClick={handleCreateNoteClick}
                                    className="bg-secondary text-on-secondary px-2.5 py-1.5 rounded-md hover:brightness-110 active:scale-95 transition-all text-[10px] font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1"
                                >
                                    <Pencil size={11} />
                                    Ghi chú
                                </button>
                                <button
                                    onClick={handleStartAiChatClick}
                                    className="bg-primary text-on-primary px-2.5 py-1.5 rounded-md hover:brightness-110 active:scale-95 transition-all text-[10px] font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1"
                                >
                                    <BookOpen size={11} />
                                    Luận đàm AI
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Sticky Audio & Notes Panel Column */}
            <div className="lg:col-span-1 flex flex-col h-full overflow-hidden gap-4">
                    {/* Audio Box */}
                    <div className="bg-surface-container-low border border-outline-variant/20 rounded-lg overflow-hidden shrink-0">
                        <div className="px-6 py-5 border-b border-outline-variant/20">
                            <span className="text-sm font-bold tracking-wider uppercase text-secondary flex items-center gap-2">
                                <Volume2 size={16} />
                                Nghe bài học
                            </span>
                        </div>
                        <div className="p-6 space-y-5">
                            <audio ref={audioRef} onEnded={handleAudioEnded} className="hidden" />

                            {audioError && (
                                <div className="flex items-start gap-2 text-sm text-on-surface-variant bg-surface-container-high p-3 rounded">
                                    <AlertTriangle size={14} className="text-secondary mt-0.5 shrink-0" />
                                    {audioError}
                                </div>
                            )}

                            {!ttsStarted ? (
                                <button
                                    onClick={handleStartAudio}
                                    disabled={isLoadingAudio}
                                    className="w-full py-4 bg-secondary text-on-secondary font-bold tracking-wider uppercase text-sm rounded flex items-center justify-center gap-2 hover:brightness-110 transition-all active:scale-95 disabled:opacity-60"
                                >
                                    <Volume2 size={16} />
                                    Nghe bài học
                                </button>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs text-on-surface-variant">
                                            <span>Đoạn {currentChunk + 1}/{chunks.length}</span>
                                            <span>{progressPct}%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-secondary transition-all duration-500"
                                                style={{ width: `${progressPct}%` }}
                                            />
                                        </div>
                                    </div>

                                    {isLoadingAudio ? (
                                        <div className="flex items-center justify-center gap-2 py-3 text-sm text-on-surface-variant">
                                            <Loader2 size={16} className="animate-spin text-secondary" />
                                            Đang tạo giọng đọc...
                                        </div>
                                    ) : (
                                        <button
                                            onClick={togglePlay}
                                            className="w-full py-3 border border-secondary text-secondary font-bold text-sm tracking-wider uppercase rounded flex items-center justify-center gap-2 hover:bg-secondary hover:text-on-secondary transition-all"
                                        >
                                            {isPlaying ? <><Pause size={15} /> Tạm dừng</> : <><Play size={15} /> Tiếp tục</>}
                                        </button>
                                    )}
                                </>
                            )}

                            <p className="text-xs text-outline leading-relaxed">
                                🎙️ Giọng đọc tiếng Việt tự nhiên. Bài học sẽ được đọc liên tục từng đoạn.
                            </p>
                        </div>
                    </div>

                    {/* Tabs Panel: Notes & AI Chat */}
                    <div className="bg-surface-container-low border border-outline-variant/20 rounded-lg overflow-hidden flex flex-col flex-1 min-h-0">
                        {/* Tab Headers */}
                        <div className="flex border-b border-outline-variant/20 bg-surface-container-lowest shrink-0">
                            <button
                                onClick={() => setActiveTab('notes')}
                                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer border-b-2
                                    ${activeTab === 'notes' 
                                        ? 'border-secondary text-secondary bg-surface-container-low/30' 
                                        : 'border-transparent text-outline hover:text-on-surface-variant'}`}
                            >
                                <Pencil size={13} />
                                Sổ tay Ghi chú ({notes.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('chat')}
                                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer border-b-2
                                    ${activeTab === 'chat' 
                                        ? 'border-primary text-primary bg-surface-container-low/30' 
                                        : 'border-transparent text-outline hover:text-on-surface-variant'}`}
                            >
                                <BookOpen size={13} />
                                Luận đàm AI
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 flex flex-col overflow-hidden">
                            {activeTab === 'notes' ? (
                                <div className="p-5 flex-1 overflow-y-auto custom-scrollbar space-y-4">
                                    {showNoteForm ? (
                                        <div className="space-y-3">
                                            <div className="text-xs text-outline leading-tight">
                                                Ghi chú cho: <span className="italic text-on-surface-variant font-medium">"{selectedText.length > 50 ? selectedText.substring(0, 50) + '...' : selectedText}"</span>
                                            </div>
                                            <textarea
                                                value={noteText}
                                                onChange={(e) => setNoteText(e.target.value)}
                                                placeholder="Nhập suy ngẫm của bạn..."
                                                className="w-full p-3 bg-surface-container-high border border-outline-variant/30 rounded text-sm text-on-surface focus:outline-none focus:border-secondary h-24 resize-none"
                                            />
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    onClick={() => { setShowNoteForm(false); setEditingNote(null); }}
                                                    className="px-3 py-1.5 text-xs border border-outline-variant/30 rounded text-on-surface hover:bg-surface-container-highest cursor-pointer"
                                                >
                                                    Hủy
                                                </button>
                                                <button
                                                    onClick={handleSaveNote}
                                                    disabled={!noteText.trim()}
                                                    className="px-3 py-1.5 text-xs bg-secondary text-on-secondary rounded font-bold hover:brightness-110 disabled:opacity-50 cursor-pointer"
                                                >
                                                    Lưu
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {notes.length === 0 ? (
                                                <p className="text-xs text-outline text-center py-4 leading-relaxed">
                                                    Chưa có ghi chú nào. Hãy bôi đen một cụm từ/câu trong bài học và chọn "Tạo ghi chú" để ghi lại suy nghĩ của bạn!
                                                </p>
                                            ) : (
                                                <div className="space-y-4">
                                                    {notes.map((note) => (
                                                        <div key={note.noteId} className="border-l-2 border-secondary/50 pl-3 py-1 space-y-1 relative group/note">
                                                            {note.selectedText && (
                                                                <div className="text-xs italic text-outline leading-tight">
                                                                    "{note.selectedText}"
                                                                </div>
                                                            )}
                                                            <div className="text-sm text-on-surface-variant font-body">
                                                                {note.noteText}
                                                            </div>
                                                            <div className="flex gap-2 opacity-0 group-hover/note:opacity-100 transition-opacity justify-end text-[10px] text-outline">
                                                                <button
                                                                    onClick={() => handleEditNoteClick(note)}
                                                                    className="hover:text-secondary flex items-center gap-0.5 cursor-pointer"
                                                                >
                                                                    Sửa
                                                                </button>
                                                                <span>•</span>
                                                                <button
                                                                    onClick={() => handleDeleteNote(note.noteId)}
                                                                    className="hover:text-red-400 flex items-center gap-0.5 cursor-pointer"
                                                                >
                                                                    Xóa
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col overflow-hidden">
                                    {/* Philosopher Row */}
                                    <div className="px-4 py-2 border-b border-outline-variant/10 bg-surface-container-lowest flex items-center gap-2 overflow-x-auto scrollbar-hide shrink-0">
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-outline shrink-0 mr-1">Triết gia:</span>
                                        <div className="flex gap-2.5">
                                            {philosophers.map((p) => {
                                                const isSelected = p.id === selectedPhilosopherId;
                                                return (
                                                    <button
                                                        key={p.id}
                                                        onClick={() => setSelectedPhilosopherId(p.id)}
                                                        className={`relative flex-shrink-0 group focus:outline-none cursor-pointer rounded-full transition-all duration-300 p-0.5
                                                            ${isSelected ? 'ring-2 ring-primary scale-110 shadow-lg shadow-primary/20' : 'hover:scale-105 opacity-60 hover:opacity-100'}`}
                                                        title={`${p.name} - ${p.category}`}
                                                    >
                                                        {p.imageUrl ? (
                                                            <img 
                                                                src={p.imageUrl} 
                                                                alt={p.name} 
                                                                className="w-7 h-7 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-7 h-7 rounded-full bg-primary-container text-primary flex items-center justify-center text-xs font-bold">
                                                                {p.name ? p.name.charAt(0) : 'P'}
                                                            </div>
                                                        )}
                                                        
                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-surface-container-highest border border-outline-variant/30 text-on-surface text-[10px] py-1 px-2 rounded whitespace-nowrap z-50 shadow-md">
                                                            <p className="font-bold">{p.name}</p>
                                                            <p className="text-outline text-[9px]">{p.category}</p>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Conversation Controls */}
                                    <div className="flex justify-between items-center px-4 py-1.5 border-b border-outline-variant/10 bg-surface-container/30 shrink-0 text-[10px]">
                                        <span className="text-outline">
                                            {chatSessionId ? 'Đang tiếp tục mạch đối thoại' : 'Luận đàm mới'}
                                        </span>
                                        {chatSessionId && (
                                            <button
                                                onClick={() => {
                                                    setChatSessionId(null);
                                                    setChatMessages([]);
                                                }}
                                                className="text-primary hover:text-secondary font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                            >
                                                <RotateCcw size={10} />
                                                Hội thoại mới
                                            </button>
                                        )}
                                    </div>

                                    {/* Message List */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-surface/20">
                                        {chatMessages.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center text-center p-4">
                                                <BookOpen size={24} className="text-primary/30 mb-2" />
                                                <p className="text-xs text-outline leading-relaxed max-w-[200px]">
                                                    Hãy đặt câu hỏi thảo luận về bài học, hoặc bôi đen một đoạn trích và chọn <strong>Luận đàm AI</strong>.
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                {chatMessages.map((msg, index) => {
                                                    const isUser = msg.role === 'user';
                                                    const philosopher = philosophers.find(p => p.id === selectedPhilosopherId);
                                                    return (
                                                        <div
                                                            key={index}
                                                            className={`flex gap-2.5 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                                                        >
                                                            {!isUser && (
                                                                <div className="shrink-0">
                                                                    {philosopher?.imageUrl ? (
                                                                        <img 
                                                                            src={philosopher.imageUrl} 
                                                                            alt={philosopher.name} 
                                                                            className="w-6 h-6 rounded-full object-cover border border-primary/20"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-6 h-6 rounded-full bg-primary-container text-primary flex items-center justify-center text-[10px] font-bold">
                                                                            {philosopher?.name ? philosopher.name.charAt(0) : 'P'}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                            
                                                            <div className={`p-3 rounded-lg text-xs leading-relaxed font-body whitespace-pre-line border
                                                                ${isUser 
                                                                    ? 'bg-surface-container-highest border-outline-variant/35 text-on-surface rounded-tr-none' 
                                                                    : 'bg-primary-container/20 border-primary/10 text-on-surface rounded-tl-none'}`}
                                                            >
                                                                {msg.content}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                                {isGeneratingResponse && (
                                                    <div className="flex gap-2.5 max-w-[85%] mr-auto items-center">
                                                        <div className="shrink-0 animate-pulse">
                                                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                                                                <Loader2 size={12} className="animate-spin text-primary" />
                                                            </div>
                                                        </div>
                                                        <div className="p-3 bg-primary-container/10 border border-primary/10 text-outline rounded-lg rounded-tl-none text-xs flex items-center gap-1.5">
                                                            <Loader2 size={12} className="animate-spin text-primary" />
                                                            Triết gia đang suy ngẫm...
                                                        </div>
                                                    </div>
                                                )}
                                                <div ref={chatEndRef} />
                                            </>
                                        )}
                                    </div>

                                    {/* Highlight Context box */}
                                    {chatHighlightContext && (
                                        <div className="px-4 py-2 bg-secondary/10 border-t border-secondary/20 flex items-start justify-between gap-2 shrink-0">
                                            <div className="text-[10px] text-on-secondary-container leading-snug italic truncate flex-1">
                                                <span className="font-bold not-italic text-secondary block mb-0.5 text-[9px] uppercase tracking-wider">Ngữ cảnh luận đàm:</span>
                                                "{chatHighlightContext}"
                                            </div>
                                            <button
                                                onClick={() => setChatHighlightContext('')}
                                                className="text-secondary hover:text-red-400 p-0.5 rounded cursor-pointer"
                                                title="Hủy ngữ cảnh"
                                            >
                                                <XCircle size={12} />
                                            </button>
                                        </div>
                                    )}

                                    {/* Chat Input Container */}
                                    <div className="p-3 border-t border-outline-variant/20 bg-surface-container-lowest flex items-center gap-2 shrink-0">
                                        <input
                                            ref={chatInputRef}
                                            type="text"
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendChatMessage();
                                                }
                                            }}
                                            disabled={isGeneratingResponse || !selectedPhilosopherId}
                                            placeholder={selectedPhilosopherId ? "Đặt câu hỏi luận đàm..." : "Chọn triết gia..."}
                                            className="flex-1 bg-surface-container-high border border-outline-variant/30 rounded px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary disabled:opacity-50"
                                        />
                                        <button
                                            onClick={handleSendChatMessage}
                                            disabled={isGeneratingResponse || !chatInput.trim() || !selectedPhilosopherId}
                                            className="p-2 bg-primary text-on-primary rounded hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shrink-0 flex items-center justify-center"
                                        >
                                            {isGeneratingResponse ? (
                                                <Loader2 size={14} className="animate-spin" />
                                            ) : (
                                                <ChevronRight size={14} className="font-bold" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Complete button */}
                    <button
                        onClick={onComplete}
                        className="w-full py-4 bg-secondary text-on-secondary font-bold tracking-wider uppercase text-sm rounded flex items-center justify-center gap-2 hover:brightness-110 transition-all active:scale-95 shadow-lg shadow-secondary/20 shrink-0"
                    >
                        Hoàn thành bài học
                        <ChevronRight size={16} />
                    </button>
            </div>
        </div>
    );
}

// ─── QUIZ STAGE ───────────────────────────────────────────────────────────────
function QuizStage({ quiz, onFinish }) {
    const [current, setCurrent] = useState(0);
    const [selected, setSelected] = useState(null);
    const [confirmed, setConfirmed] = useState(false);
    const [answers, setAnswers] = useState([]); // { questionIndex, selectedIndex, correct }

    const question = quiz.questions[current];
    const isCorrect = selected === question?.correctIndex;
    const isLast = current === quiz.questions.length - 1;

    const handleSelect = (idx) => {
        if (confirmed) return;
        setSelected(idx);
    };

    const handleConfirm = () => {
        if (selected === null) return;
        setConfirmed(true);
        setAnswers(prev => [...prev, {
            questionIndex: current,
            selectedIndex: selected,
            correct: selected === question.correctIndex
        }]);
    };

    const handleNext = () => {
        if (isLast) {
            onFinish([...answers]);
        } else {
            setCurrent(c => c + 1);
            setSelected(null);
            setConfirmed(false);
        }
    };

    const progress = ((current) / quiz.questions.length) * 100;

    return (
        <div className="max-w-2xl mx-auto w-full flex-1 overflow-y-auto custom-scrollbar py-4">
            {/* Header */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-3 text-xs text-on-surface-variant uppercase tracking-wider font-bold">
                    <span>Câu {current + 1}/{quiz.questions.length}</span>
                    <span>{quiz.title}</span>
                </div>
                <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-secondary transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
            </div>

            {/* Question Card */}
            <div className="bg-surface-container-low border border-outline-variant/20 rounded-lg p-8 mb-6 relative overflow-hidden">
                <div className="absolute inset-0 paper-texture pointer-events-none" />
                <h3 className="font-display text-2xl font-semibold text-on-surface leading-snug relative z-10">
                    {question?.question}
                </h3>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-6">
                {question?.options.map((opt, idx) => {
                    const isSelected = selected === idx;
                    const isRight = confirmed && idx === question.correctIndex;
                    const isWrong = confirmed && isSelected && !isRight;

                    return (
                        <button
                            key={idx}
                            onClick={() => handleSelect(idx)}
                            disabled={confirmed}
                            className={`w-full flex items-center gap-4 p-4 text-left rounded-lg border transition-all active:scale-[0.99]
                                ${isRight ? 'border-emerald-500/60 bg-emerald-500/10' :
                                  isWrong ? 'border-red-500/60 bg-red-500/10' :
                                  isSelected ? 'border-secondary bg-secondary/10' :
                                  'border-outline-variant/30 bg-surface/40 hover:border-secondary/40 hover:bg-secondary/5'}
                                ${confirmed ? 'cursor-default' : 'cursor-pointer'}`}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0
                                ${isRight ? 'bg-emerald-500 text-white' :
                                  isWrong ? 'bg-red-500 text-white' :
                                  isSelected ? 'bg-secondary text-on-secondary' :
                                  'bg-surface-container-high text-on-surface-variant'}`}>
                                {['A','B','C','D'][idx]}
                            </div>
                            <span className={`flex-1 text-base
                                ${isRight ? 'text-emerald-400 font-medium' :
                                  isWrong ? 'text-red-400' :
                                  isSelected ? 'text-secondary font-medium' :
                                  'text-on-surface'}`}>
                                {opt}
                            </span>
                            {isRight && <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />}
                            {isWrong && <XCircle size={18} className="text-red-400 shrink-0" />}
                        </button>
                    );
                })}
            </div>

            {/* Explanation (sau khi confirm) */}
            {confirmed && question?.explanation && (
                <div className={`p-4 rounded-lg mb-6 border text-sm leading-relaxed
                    ${isCorrect ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-300' :
                                  'border-red-500/30 bg-red-500/5 text-red-300'}`}>
                    <span className="font-bold block mb-1">
                        {isCorrect ? '✅ Chính xác!' : '❌ Chưa đúng!'}
                    </span>
                    {question.explanation}
                </div>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center">
                {!confirmed ? (
                    <button
                        onClick={handleConfirm}
                        disabled={selected === null}
                        className="ml-auto px-8 py-3 bg-secondary text-on-secondary font-bold text-sm tracking-wider uppercase rounded flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Xác nhận
                        <CheckCircle2 size={15} />
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        className="ml-auto px-8 py-3 bg-secondary text-on-secondary font-bold text-sm tracking-wider uppercase rounded flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all"
                    >
                        {isLast ? 'Xem kết quả' : 'Câu tiếp theo'}
                        <ChevronRight size={15} />
                    </button>
                )}
            </div>
        </div>
    );
}

// ─── RESULT STAGE ─────────────────────────────────────────────────────────────
function ResultStage({ quiz, answers, onRestart, onBack }) {
    const score = answers.filter(a => a.correct).length;
    const total = quiz.questions.length;
    const pct = Math.round((score / total) * 100);

    const grade = pct >= 90 ? { label: 'Xuất sắc', color: 'text-secondary' } :
                  pct >= 70 ? { label: 'Khá tốt', color: 'text-primary' } :
                  pct >= 50 ? { label: 'Trung bình', color: 'text-tertiary' } :
                              { label: 'Cần cố gắng thêm', color: 'text-on-surface-variant' };

    return (
        <div className="max-w-xl mx-auto text-center w-full flex-1 overflow-y-auto custom-scrollbar py-4">
            {/* Trophy */}
            <div className="mb-8 flex justify-center">
                <div className="w-24 h-24 rounded-full bg-secondary/10 border border-secondary/30 flex items-center justify-center">
                    <Trophy size={40} className="text-secondary" />
                </div>
            </div>

            <h2 className="font-display text-4xl font-bold text-on-surface mb-2">Kết quả bài kiểm tra</h2>
            <p className="text-on-surface-variant mb-8">{quiz.title}</p>

            {/* Score */}
            <div className="bg-surface-container-low border border-outline-variant/20 rounded-lg p-8 mb-6 relative overflow-hidden">
                <div className="absolute inset-0 paper-texture pointer-events-none" />
                <div className="relative z-10">
                    <div className="text-7xl font-display font-bold text-secondary mb-2">
                        {score}<span className="text-3xl text-on-surface-variant">/{total}</span>
                    </div>
                    <div className={`text-xl font-bold mb-4 ${grade.color}`}>{grade.label}</div>
                    <div className="w-full h-3 bg-surface-container-highest rounded-full overflow-hidden">
                        <div
                            className="h-full bg-secondary transition-all duration-1000 rounded-full"
                            style={{ width: `${pct}%` }}
                        />
                    </div>
                    <div className="text-sm text-on-surface-variant mt-2">{pct}% chính xác</div>
                </div>
            </div>

            {/* Detail per question */}
            <div className="text-left space-y-2 mb-8">
                {answers.map((a, i) => (
                    <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border text-sm
                        ${a.correct ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                        {a.correct
                            ? <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                            : <XCircle size={16} className="text-red-400 shrink-0" />}
                        <span className={a.correct ? 'text-emerald-300' : 'text-red-300'}>
                            Câu {i + 1}: {a.correct ? 'Đúng' : `Sai (Đáp án: ${['A','B','C','D'][quiz.questions[i]?.correctIndex]})`}
                        </span>
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                    onClick={onRestart}
                    className="flex items-center justify-center gap-2 px-6 py-3 border border-secondary text-secondary font-bold text-sm tracking-wider uppercase rounded hover:bg-secondary hover:text-on-secondary transition-all"
                >
                    <RotateCcw size={14} />
                    Làm lại quiz
                </button>
                <button
                    onClick={onBack}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-secondary text-on-secondary font-bold text-sm tracking-wider uppercase rounded hover:brightness-110 transition-all"
                >
                    <ArrowLeft size={14} />
                    Quay lại thư viện
                </button>
            </div>
        </div>
    );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function LessonPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const key = searchParams.get('key');

    const [stage, setStage] = useState(STAGES.READING);
    const [lesson, setLesson] = useState(null);
    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [lessonLoading, setLessonLoading] = useState(true);
    const [quizLoading, setQuizLoading] = useState(false);
    const [lessonError, setLessonError] = useState(null);
    const [quizError, setQuizError] = useState(null);

    // Load lesson content
    useEffect(() => {
        if (!key) {
            navigate('/Study');
            return;
        }
        (async () => {
            setLessonLoading(true);
            setLessonError(null);
            try {
                const data = await fetchLessonContent(key);
                setLesson(data);
            } catch (e) {
                setLessonError(e.response?.data?.message || e.message || 'Không thể tải bài học');
            } finally {
                setLessonLoading(false);
            }
        })();
    }, [key]);

    // Chuyển sang quiz stage: load quiz và gọi API hoàn thành
    const handleCompleteLesson = async () => {
        setStage(STAGES.QUIZ);

        try {
            await apiClient.post('/users/complete-file', { key });
        } catch (err) {
            console.error('Failed to mark lesson complete:', err);
        }

        if (quiz) return; // đã load rồi

        setQuizLoading(true);
        setQuizError(null);
        try {
            const data = await generateQuiz(key);
            setQuiz(data);
        } catch (e) {
            setQuizError(e.response?.data?.message || e.message || 'Không thể tạo bài quiz');
        } finally {
            setQuizLoading(false);
        }
    };

    const handleQuizFinish = (finalAnswers) => {
        setAnswers(finalAnswers);
        setStage(STAGES.RESULT);
    };

    const handleRestartQuiz = () => {
        setStage(STAGES.QUIZ);
        setAnswers([]);
    };

    return (
        <div className="min-h-screen bg-background text-on-background selection:bg-secondary/30 selection:text-secondary">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/30 h-16 flex items-center px-6 gap-4">
                <button
                    onClick={() => navigate('/Study')}
                    className="flex items-center gap-2 text-on-surface-variant hover:text-secondary transition-colors text-sm font-medium"
                >
                    <ArrowLeft size={16} />
                    Thư viện
                </button>

                {/* Stage indicator */}
                <div className="ml-auto flex items-center gap-2">
                    {[
                        { id: STAGES.READING, label: 'Bài học' },
                        { id: STAGES.QUIZ, label: 'Ôn tập' },
                        { id: STAGES.RESULT, label: 'Kết quả' },
                    ].map((s, i) => {
                        const isClickable = s.id === STAGES.READING || 
                                            (s.id === STAGES.QUIZ && lesson) || 
                                            (s.id === STAGES.RESULT && answers.length > 0);
                        
                        const handleStageClick = () => {
                            if (!isClickable) return;
                            if (s.id === STAGES.READING) {
                                setStage(STAGES.READING);
                            } else if (s.id === STAGES.QUIZ) {
                                handleCompleteLesson();
                            } else if (s.id === STAGES.RESULT) {
                                setStage(STAGES.RESULT);
                            }
                        };

                        return (
                            <div key={s.id} className="flex items-center gap-2">
                                <button
                                    onClick={handleStageClick}
                                    disabled={!isClickable}
                                    className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full transition-all
                                        ${stage === s.id ? 'bg-secondary text-on-secondary' : 'text-on-surface-variant hover:text-secondary'}
                                        ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                                >
                                    <span className="opacity-60">{i + 1}.</span>
                                    {s.label}
                                </button>
                                {i < 2 && <ChevronRight size={12} className="text-outline-variant" />}
                            </div>
                        );
                    })}
                </div>
            </header>

            {/* Main Content */}
            <main className="h-screen pt-16 pb-6 px-4 md:px-12 max-w-[1200px] mx-auto flex flex-col overflow-hidden">

                {/* READING STAGE */}
                {stage === STAGES.READING && (
                    lessonLoading ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-4">
                            <Loader2 size={36} className="animate-spin text-secondary" />
                            <p className="text-on-surface-variant">Đang tải nội dung bài học...</p>
                        </div>
                    ) : lessonError ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
                            <AlertTriangle size={36} className="text-secondary opacity-70" />
                            <p className="text-on-surface font-semibold text-lg">Không thể tải bài học</p>
                            <p className="text-on-surface-variant max-w-md">{lessonError}</p>
                            <button
                                onClick={() => navigate('/Study')}
                                className="mt-2 px-6 py-3 border border-secondary text-secondary text-sm font-bold tracking-wider uppercase rounded hover:bg-secondary hover:text-on-secondary transition-all"
                            >
                                Quay lại thư viện
                            </button>
                        </div>
                    ) : (
                        <ReadingStage lesson={lesson} s3Key={key} onComplete={handleCompleteLesson} />
                    )
                )}

                {/* QUIZ STAGE */}
                {stage === STAGES.QUIZ && (
                    quizLoading ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-6">
                            <div className="relative">
                                <Loader2 size={48} className="animate-spin text-secondary" />
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-semibold text-on-surface mb-2">AI đang tạo bài kiểm tra...</p>
                                <p className="text-sm text-on-surface-variant">Đang phân tích nội dung và sinh câu hỏi tiếng Việt</p>
                            </div>
                        </div>
                    ) : quizError ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
                            <AlertTriangle size={36} className="text-secondary opacity-70" />
                            <p className="text-on-surface font-semibold text-lg">Không thể tạo bài quiz</p>
                            <p className="text-on-surface-variant max-w-md">{quizError}</p>
                            <button
                                onClick={handleCompleteLesson}
                                className="mt-2 px-6 py-3 bg-secondary text-on-secondary text-sm font-bold tracking-wider uppercase rounded hover:brightness-110 transition-all"
                            >
                                Thử lại
                            </button>
                        </div>
                    ) : quiz ? (
                        <QuizStage quiz={quiz} onFinish={handleQuizFinish} />
                    ) : null
                )}

                {/* RESULT STAGE */}
                {stage === STAGES.RESULT && quiz && (
                    <ResultStage
                        quiz={quiz}
                        answers={answers}
                        onRestart={handleRestartQuiz}
                        onBack={() => navigate('/Study')}
                    />
                )}
            </main>
        </div>
    );
}
