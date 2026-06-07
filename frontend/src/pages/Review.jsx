import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import apiClient from '@/services/apiClient';
import { fetchDocuments, getFileTypeInfo, formatFileSize } from '@/services/documentService';
import { FileText, Award, Calendar, ChevronRight, Sparkles, RefreshCw, Loader2, BookOpen } from 'lucide-react';
import '@/assets/styles/philoverse-study.css';
import Footer from "@/components/Footer.jsx"; // Reusing styles

export default function Review() {
    const navigate = useNavigate();
    const [documents, setDocuments] = useState([]);
    const [loadingDocs, setLoadingDocs] = useState(true);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [quizSets, setQuizSets] = useState([]);
    const [loadingSets, setLoadingSets] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch all documents from S3
    useEffect(() => {
        const loadDocs = async () => {
            try {
                const data = await fetchDocuments();
                setDocuments(data);
                if (data.length > 0) {
                    handleSelectDoc(data[0]);
                }
            } catch (err) {
                console.error('Failed to fetch documents:', err);
            } finally {
                setLoadingDocs(false);
            }
        };
        loadDocs();
    }, []);

    // Fetch quiz sets for selected document
    const handleSelectDoc = async (doc) => {
        setSelectedDoc(doc);
        setLoadingSets(true);
        try {
            const response = await apiClient.get(`/quiz-sets?s3Key=${encodeURIComponent(doc.key)}`);
            setQuizSets(response.data?.result ?? []);
        } catch (err) {
            console.error('Failed to fetch quiz sets:', err);
            setQuizSets([]);
        } finally {
            setLoadingSets(false);
        }
    };

    // Generate a new 20-question quiz set using AI
    const handleGenerateQuizSet = async () => {
        if (!selectedDoc) return;
        setGenerating(true);
        try {
            const response = await apiClient.post('/quiz-sets/generate', {
                s3Key: selectedDoc.key,
                title: `Bộ đề ôn tập: ${selectedDoc.title || selectedDoc.fileName}`
            });
            // Refresh quiz sets
            const refreshResp = await apiClient.get(`/quiz-sets?s3Key=${encodeURIComponent(selectedDoc.key)}`);
            setQuizSets(refreshResp.data?.result ?? []);
        } catch (err) {
            console.error('Failed to generate quiz set:', err);
            alert(err.response?.data?.message || 'Không thể tạo bộ đề. Vui lòng kiểm tra lại cấu hình AI (Ollama/Google GenAI) của bạn.');
        } finally {
            setGenerating(false);
        }
    };

    const filteredDocs = documents.filter(doc => {
        const titleMatch = doc.title?.toLowerCase().includes(searchQuery.toLowerCase());
        const fileMatch = doc.fileName?.toLowerCase().includes(searchQuery.toLowerCase());
        return titleMatch || fileMatch;
    });

    return (
        <div className="min-h-screen bg-background text-on-background selection:bg-secondary/30 selection:text-secondary">
            <Sidebar />

            <main className="md:ml-64 min-h-screen bg-surface">
                <div className="pt-24 px-4 md:px-12 py-12">
                    {/* Page Header */}
                    <div className="mb-10">
                        <span className="text-xs uppercase tracking-[0.3em] text-secondary mb-2 block font-medium">
                            Hệ thống luyện tập
                        </span>
                        <h2 className="font-display text-5xl text-on-background font-bold tracking-tight">
                            Ôn tập học giả
                        </h2>
                        <p className="text-on-surface-variant mt-2 text-sm max-w-2xl">
                            Chọn tài liệu ôn tập để làm bài luyện tập. AI sẽ hỗ trợ biên soạn 20 câu hỏi bao gồm đầy đủ 6 thể loại kiểm tra để kiểm tra toàn diện kiến thức của bạn.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                        {/* Left Column: Documents List */}
                        <div className="xl:col-span-5 space-y-6">
                            <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-6 relative">
                                <div className="absolute inset-0 paper-texture pointer-events-none rounded-xl" />
                                <h3 className="font-display text-lg font-bold text-on-surface mb-4">Danh sách tài liệu</h3>
                                
                                <div className="relative mb-4">
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm tài liệu..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-4 pr-10 py-2.5 bg-surface-container-high border border-outline-variant/30 rounded text-sm text-on-surface placeholder:text-outline-variant focus:outline-none focus:border-secondary/60 transition-all"
                                    />
                                </div>

                                {loadingDocs ? (
                                    <div className="flex flex-col items-center justify-center py-12 gap-3 text-outline">
                                        <Loader2 className="w-8 h-8 animate-spin" />
                                        <span className="text-xs">Đang tải tài liệu...</span>
                                    </div>
                                ) : filteredDocs.length === 0 ? (
                                    <div className="text-center py-12 text-outline text-sm">Chưa có tài liệu nào</div>
                                ) : (
                                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                                        {filteredDocs.map((doc) => {
                                            const isSelected = selectedDoc?.key === doc.key;
                                            const { icon, color } = getFileTypeInfo(doc.contentType);
                                            return (
                                                <button
                                                    key={doc.key}
                                                    onClick={() => handleSelectDoc(doc)}
                                                    className={`w-full text-left p-4 rounded-lg border transition-all duration-300 flex items-center gap-4 ${
                                                        isSelected
                                                            ? 'bg-secondary/10 border-secondary text-secondary'
                                                            : 'bg-surface-container-high border-outline-variant/10 text-on-surface hover:border-secondary/40'
                                                    }`}
                                                >
                                                    <span className={`material-symbols-outlined text-[32px] ${color}`}>
                                                        {icon}
                                                    </span>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-semibold text-sm truncate leading-tight">
                                                            {doc.title || doc.fileName}
                                                        </h4>
                                                        <p className="text-[11px] text-outline mt-1 truncate">
                                                            {doc.fileName} • {formatFileSize(doc.fileSize)}
                                                        </p>
                                                    </div>
                                                    <ChevronRight className={`w-4 h-4 text-outline transition-transform ${isSelected ? 'rotate-90 text-secondary' : ''}`} />
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Quiz Sets list */}
                        <div className="xl:col-span-7">
                            <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-8 min-h-[450px] relative flex flex-col">
                                <div className="absolute inset-0 paper-texture pointer-events-none rounded-xl" />

                                {selectedDoc ? (
                                    <>
                                        {/* Document Header */}
                                        <div className="border-b border-outline-variant/20 pb-6 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-2 text-xs text-secondary font-semibold uppercase tracking-wider mb-1">
                                                    <FileText className="w-3.5 h-3.5" />
                                                    Tài liệu đang chọn
                                                </div>
                                                <h3 className="font-display text-2xl font-bold text-on-surface leading-snug">
                                                    {selectedDoc.title || selectedDoc.fileName}
                                                </h3>
                                            </div>

                                            <button
                                                onClick={handleGenerateQuizSet}
                                                disabled={generating || loadingSets}
                                                className="self-start sm:self-center flex items-center gap-2 px-5 py-3 bg-secondary text-on-secondary rounded text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer shadow-md active:scale-95 whitespace-nowrap"
                                            >
                                                <Sparkles className="w-4 h-4" />
                                                Tạo đề mới bằng AI
                                            </button>
                                        </div>

                                        {/* Quiz Sets Lists */}
                                        {loadingSets ? (
                                            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-outline">
                                                <Loader2 className="w-8 h-8 animate-spin" />
                                                <span className="text-xs">Đang tìm kiếm bộ đề ôn tập...</span>
                                            </div>
                                        ) : quizSets.length === 0 ? (
                                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-4">
                                                <BookOpen className="w-12 h-12 text-outline/40 animate-pulse" />
                                                <div>
                                                    <h4 className="font-semibold text-lg text-on-surface">Chưa có bộ đề ôn tập nào</h4>
                                                    <p className="text-xs text-outline max-w-sm mt-1 mx-auto leading-relaxed">
                                                        Hãy nhấn nút "Tạo đề mới bằng AI" ở trên để AI tạo ngay một bộ đề ôn tập gồm 20 câu hỏi ngẫu nhiên bám sát nội dung cuốn sách này.
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex-1 space-y-4 max-h-[500px] overflow-y-auto pr-1">
                                                {quizSets.map((set, idx) => (
                                                    <div
                                                        key={set.quizSetId}
                                                        className="bg-surface-container-high border border-outline-variant/10 rounded-xl p-5 hover:border-secondary/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                                    >
                                                        <div className="space-y-1">
                                                            <h4 className="font-semibold text-base text-on-surface flex items-center gap-2">
                                                                <Award className="w-4.5 h-4.5 text-secondary" />
                                                                {`Bộ đề số ${idx + 1}: ${set.title ? set.title.replace(/^Bộ đề\s*(?:ôn tập|số\s*\d+)?\s*:\s*/i, '') : ''}`}
                                                            </h4>
                                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-outline mt-1.5">
                                                                <span className="flex items-center gap-1">
                                                                    <BookOpen className="w-3.5 h-3.5" />
                                                                    {set.questionCount} câu hỏi
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="w-3.5 h-3.5" />
                                                                    {new Date(set.createdAt).toLocaleDateString('vi-VN')}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <button
                                                            onClick={() => navigate(`/review/play/${set.quizSetId}`)}
                                                            className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-surface-container-highest border border-outline-variant/30 text-secondary hover:bg-secondary hover:text-on-secondary hover:border-transparent rounded font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                                                        >
                                                            Vào ôn tập
                                                            <ChevronRight className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-4">
                                        <Loader2 className="w-8 h-8 text-outline animate-spin" />
                                        <span className="text-sm text-outline">Đang kết nối thư viện...</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </main>

            {/* AI Generation Loading Overlay */}
            {generating && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[9999] flex flex-col items-center justify-center gap-6 p-4">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin" />
                        <Sparkles className="w-8 h-8 text-secondary absolute inset-0 m-auto animate-pulse" />
                    </div>
                    <div className="text-center space-y-2 max-w-md">
                        <h3 className="font-display text-2xl font-bold text-on-background">Đang tạo đề ôn tập bằng AI</h3>
                        <p className="text-sm text-on-surface-variant leading-relaxed">
                            AI đang đọc tài liệu, soạn thảo 20 câu hỏi triết học đa dạng (trắc nghiệm, điền từ, đúng-sai, nối cột, dòng thời gian và tình huống). Quá trình này có thể mất từ 30-40 giây. Vui lòng không đóng cửa sổ này.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
