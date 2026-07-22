import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import apiClient from '@/services/apiClient';
import { 
  Trophy, 
  Calendar, 
  Clock, 
  Search, 
  Award, 
  ChevronRight, 
  RefreshCw, 
  Loader2, 
  ArrowRight,
  BookOpen,
  Sparkles,
  X,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { getFriendlyDocumentTitle } from '@/utils/curriculumMapping';
import '@/assets/styles/philoverse-study.css';
import Footer from "@/components/Footer.jsx";

const formatQuizSetTitle = (title) => {
    if (!title) return 'Bài kiểm tra ôn tập';
    const match = title.match(/^(Bộ đề số \d+):\s*(.*)$/);
    if (match) {
        return `${match[1]}: ${getFriendlyDocumentTitle(match[2])}`;
    }
    return getFriendlyDocumentTitle(title);
};

const renderQuestionAnswers = (q) => {
    switch (q.quizType) {
        case 'MULTIPLE_CHOICE':
        case 'TRUE_FALSE':
        case 'SCENARIO':
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {q.options.map((opt) => {
                        const isSelected = opt.optionId === q.selectedOptionId;
                        const isCorrect = opt.isCorrect;
                        
                        let cardClass = "flex items-center gap-3 p-3 rounded-lg border text-xs transition-colors ";
                        let icon = null;
                        
                        if (isCorrect) {
                            cardClass += "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-semibold";
                            icon = <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
                        } else if (isSelected && !isCorrect) {
                            cardClass += "bg-rose-500/10 border-rose-500/30 text-rose-400 font-semibold";
                            icon = <XCircle className="w-4 h-4 text-rose-500 shrink-0" />;
                        } else {
                            cardClass += "bg-surface-container-highest/20 border-outline-variant/10 text-on-surface-variant";
                        }
                        
                        return (
                            <div key={opt.optionId} className={cardClass}>
                                {icon ? icon : <div className="w-4 h-4 rounded-full border border-outline-variant/30 shrink-0" />}
                                <span className="flex-1">{opt.optionText}</span>
                                {isSelected && (
                                    <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 bg-surface-container rounded border border-outline-variant/20 text-on-surface-variant">
                                        Đáp án của bạn
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            );
            
        case 'FILL_IN_THE_BLANK':
            const correctOpt = q.options.find(o => o.isCorrect) || q.options[0];
            const correctText = correctOpt ? correctOpt.optionText : '';
            const userBlankText = q.blankText || '';
            const isBlankCorrect = q.isCorrect;
            
            return (
                <div className="space-y-2 max-w-lg">
                    <div className="flex flex-col gap-1.5 p-3 rounded-lg border bg-surface-container-highest/10 border-outline-variant/10">
                        <span className="text-[10px] text-on-surface-variant/60 font-semibold uppercase tracking-wider">Câu trả lời của bạn:</span>
                        <div className={`flex items-center gap-2 font-display text-xs font-semibold ${isBlankCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isBlankCorrect ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
                            <span>{userBlankText || <em className="text-on-surface-variant/40 font-normal">Không trả lời</em>}</span>
                        </div>
                    </div>
                    
                    {!isBlankCorrect && (
                        <div className="flex flex-col gap-1.5 p-3 rounded-lg border bg-emerald-500/5 border-emerald-500/20">
                            <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Đáp án đúng:</span>
                            <div className="flex items-center gap-2 font-display text-xs font-semibold text-emerald-400">
                                <CheckCircle2 className="w-4 h-4 shrink-0" />
                                <span>{correctText}</span>
                            </div>
                        </div>
                    )}
                </div>
            );
            
        case 'MATCHING':
            const dbPairs = q.options.map(opt => {
                const parts = opt.optionText.split('|');
                return {
                    left: parts[0]?.trim() || '',
                    right: parts[1]?.trim() || '',
                    optionText: opt.optionText
                };
            });
            
            const userMatches = q.matches || [];
            const isPairCorrect = (left, right) => {
                const clean = (t) => t.toLowerCase().trim().replace(/[\.\,\!\?]+$/, '');
                return dbPairs.some(pair => clean(pair.left) === clean(left) && clean(pair.right) === clean(right));
            };
            
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <h4 className="text-[10px] text-on-surface-variant/70 font-semibold uppercase tracking-wider mb-2">Đáp án của bạn:</h4>
                        {userMatches.length === 0 ? (
                            <p className="text-xs text-on-surface-variant/40 italic">Chưa ghép cặp nào</p>
                        ) : (
                            userMatches.map((pair, pIdx) => {
                                const correct = isPairCorrect(pair.left, pair.right);
                                return (
                                    <div 
                                        key={pIdx} 
                                        className={`flex items-center justify-between gap-2 p-2.5 rounded-lg border text-xs ${
                                            correct 
                                                ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' 
                                                : 'bg-rose-500/5 border-rose-500/20 text-rose-400'
                                        }`}
                                    >
                                        <span className="font-medium">{pair.left}</span>
                                        <span className="text-[10px] opacity-60">➔</span>
                                        <span className="font-semibold text-right">{pair.right}</span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                    
                    <div className="space-y-2">
                        <h4 className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider mb-2">Đáp án đúng gốc:</h4>
                        {dbPairs.map((pair, pIdx) => (
                            <div 
                                key={pIdx} 
                                className="flex items-center justify-between gap-2 p-2.5 rounded-lg border bg-emerald-500/10 border-emerald-500/30 text-emerald-400 text-xs font-semibold"
                            >
                                <span className="font-medium">{pair.left}</span>
                                <span className="text-[10px] opacity-60">➔</span>
                                <span className="text-right">{pair.right}</span>
                            </div>
                        ))}
                    </div>
                </div>
            );
            
        case 'TIMELINE':
            const correctTimeline = [...q.options].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
            const userTimeline = (q.orderedOptionIds || []).map(id => q.options.find(o => o.optionId === id)).filter(Boolean);
            const isPositionCorrect = (item, idx) => {
                return correctTimeline[idx]?.optionId === item?.optionId;
            };
            
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <h4 className="text-[10px] text-on-surface-variant/70 font-semibold uppercase tracking-wider mb-2">Thứ tự bạn xếp:</h4>
                        {userTimeline.length === 0 ? (
                            <p className="text-xs text-on-surface-variant/40 italic">Chưa sắp xếp thứ tự</p>
                        ) : (
                            userTimeline.map((item, tIdx) => {
                                const correct = isPositionCorrect(item, tIdx);
                                return (
                                    <div 
                                        key={item.optionId} 
                                        className={`flex items-center gap-3 p-2.5 rounded-lg border text-xs ${
                                            correct 
                                                ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' 
                                                : 'bg-rose-500/5 border-rose-500/20 text-rose-400'
                                        }`}
                                    >
                                        <span className="w-5 h-5 rounded-full bg-surface-container flex items-center justify-center font-bold text-[10px] shrink-0 border border-outline-variant/20">
                                            {tIdx + 1}
                                        </span>
                                        <span className="font-semibold">{item.optionText}</span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                    
                    <div className="space-y-2">
                        <h4 className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider mb-2">Thứ tự đúng:</h4>
                        {correctTimeline.map((item, tIdx) => (
                            <div 
                                key={item.optionId} 
                                className="flex items-center gap-3 p-2.5 rounded-lg border bg-emerald-500/10 border-emerald-500/30 text-emerald-400 text-xs font-semibold"
                            >
                                <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center font-bold text-[10px] shrink-0">
                                    {tIdx + 1}
                                </span>
                                <span>{item.optionText}</span>
                            </div>
                        ))}
                    </div>
                </div>
            );
            
        default:
            return <p className="text-xs text-on-surface-variant">Không hỗ trợ hiển thị loại câu hỏi này.</p>;
    }
};


export default function QuizHistory() {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal states
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [modalError, setModalError] = useState(null);

    const fetchHistory = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.get('/quiz-sets/history');
            setHistory(response.data?.result ?? []);
        } catch (err) {
            console.error('Failed to fetch quiz history:', err);
            setError('Không thể tải lịch sử làm bài. Vui lòng kiểm tra lại kết nối hoặc đăng nhập.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenReview = async (submissionId) => {
        setSelectedSubmission(submissionId);
        setModalOpen(true);
        setModalLoading(true);
        setModalError(null);
        setModalData(null);
        try {
            const response = await apiClient.get(`/quiz-sets/history/${submissionId}`);
            setModalData(response.data?.result ?? null);
        } catch (err) {
            console.error('Failed to fetch submission details:', err);
            setModalError('Không thể tải chi tiết bài làm. Vui lòng thử lại sau.');
        } finally {
            setModalLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const filteredHistory = useMemo(() => {
        if (!searchQuery.trim()) return history;
        const query = searchQuery.toLowerCase();
        return history.filter(item => {
            const friendlyDocTitle = getFriendlyDocumentTitle(item.documentTitle).toLowerCase();
            const friendlyQuizSetTitle = formatQuizSetTitle(item.quizSetTitle).toLowerCase();
            return friendlyDocTitle.includes(query) || friendlyQuizSetTitle.includes(query);
        });
    }, [history, searchQuery]);

    // Calculate overall statistics
    const stats = useMemo(() => {
        if (history.length === 0) {
            return { totalAttempts: 0, avgScorePercent: 0, totalXpGained: 0 };
        }
        const totalAttempts = history.length;
        const totalXpGained = history.reduce((sum, item) => sum + (item.xpGained || 0), 0);
        
        const totalScore = history.reduce((sum, item) => sum + (item.score || 0), 0);
        const totalQuestions = history.reduce((sum, item) => sum + (item.totalQuestions || 20), 0);
        const avgScorePercent = Math.round((totalScore / totalQuestions) * 100);

        return { totalAttempts, avgScorePercent, totalXpGained };
    }, [history]);

    // Format date time helper
    const formatDateTime = (dateStr) => {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            // check valid date
            if (isNaN(date.getTime())) return dateStr;
            
            // Format: 10:25, 22 Tháng 6, 2026
            return date.toLocaleString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });
        } catch (e) {
            return dateStr;
        }
    };

    return (
        <div className="min-h-screen bg-background text-on-background selection:bg-secondary/30 selection:text-secondary">
            <Sidebar />

            <main className="md:ml-64 min-h-screen bg-surface flex flex-col justify-between">
                <div className="pt-24 px-4 md:px-12 py-12 flex-grow">
                    {/* Page Header */}
                    <div className="mb-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                        <div className="max-w-xl">
                            <span className="text-xs uppercase tracking-[0.3em] text-secondary mb-2 block font-medium">
                                Nhật ký rèn luyện
                            </span>
                            <h2 className="font-display text-5xl text-on-background font-bold tracking-tight">
                                Lịch sử ôn tập
                            </h2>
                            <p className="text-on-surface-variant mt-2 text-sm leading-relaxed">
                                Xem lại kết quả ôn tập học giả và điểm thưởng của bạn. Dữ liệu sẽ tự động được xóa sau 30 ngày để tối ưu hệ thống.
                            </p>
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-3 gap-4 w-full xl:w-auto min-w-[320px] sm:min-w-[480px]">
                            <div className="bg-surface-container border border-outline-variant/10 rounded-xl p-4 text-center shadow-sm">
                                <p className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Lượt làm</p>
                                <p className="text-2xl font-display font-bold text-primary mt-1">{stats.totalAttempts}</p>
                            </div>
                            <div className="bg-surface-container border border-outline-variant/10 rounded-xl p-4 text-center shadow-sm">
                                <p className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Độ chính xác</p>
                                <p className="text-2xl font-display font-bold text-secondary mt-1">{stats.avgScorePercent}%</p>
                            </div>
                            <div className="bg-surface-container border border-outline-variant/10 rounded-xl p-4 text-center shadow-sm">
                                <p className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">XP Tích Lũy</p>
                                <p className="text-2xl font-display font-bold text-tertiary mt-1">+{stats.totalXpGained}</p>
                            </div>
                        </div>
                    </div>

                    {/* Filter and Action Bar */}
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
                        <div className="relative w-full md:w-80">
                            <Search className="w-4 h-4 text-on-surface-variant/60 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm bộ đề hoặc tài liệu..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-xs bg-surface-container border border-outline-variant/20 rounded-lg text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-secondary transition-colors"
                            />
                        </div>

                        <button 
                            onClick={fetchHistory}
                            disabled={loading}
                            className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-secondary/10 hover:bg-secondary/20 active:bg-secondary/30 text-secondary text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                            Làm mới
                        </button>
                    </div>

                    {/* Main Content Area */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-surface-container/20 rounded-2xl border border-outline-variant/10">
                            <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
                            <p className="text-xs text-on-surface-variant/60">Đang tải lịch sử làm bài...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-16 px-4 bg-surface-container/20 rounded-2xl border border-red-500/20 text-center">
                            <p className="text-sm text-red-500 font-semibold mb-2">Đã xảy ra lỗi</p>
                            <p className="text-xs text-on-surface-variant max-w-sm mb-4">{error}</p>
                            <button 
                                onClick={fetchHistory}
                                className="px-4 py-2 bg-secondary text-on-secondary text-xs font-bold rounded-lg hover:shadow-md transition-shadow"
                            >
                                Thử lại
                            </button>
                        </div>
                    ) : filteredHistory.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 px-4 bg-surface-container/20 rounded-2xl border border-outline-variant/10 text-center">
                            <Award className="w-12 h-12 text-on-surface-variant/30 mb-4" />
                            <h3 className="font-display text-lg font-bold text-on-surface mb-1">Chưa tìm thấy lịch sử rèn luyện</h3>
                            <p className="text-xs text-on-surface-variant max-w-sm mb-6 leading-relaxed">
                                {searchQuery ? 'Không tìm thấy kết quả phù hợp với từ khóa tìm kiếm.' : 'Bạn chưa thực hiện bất kỳ bài thi trắc nghiệm hay kéo thả nào trong hệ thống.'}
                            </p>
                            <button 
                                onClick={() => navigate('/review')}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary text-xs font-bold rounded-lg shadow-sm hover:shadow-md transition-shadow"
                            >
                                Đến trang Ôn tập
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredHistory.map((item) => {
                                const isPassed = item.score >= (item.totalQuestions / 2);
                                return (
                                    <div 
                                        key={item.submissionId}
                                        onClick={() => handleOpenReview(item.submissionId)}
                                        className="bg-surface-container border border-outline-variant/10 rounded-xl p-5 hover:border-outline-variant/30 hover:shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-surface-container-high/60"
                                    >
                                        <div className="space-y-2 flex-grow">
                                            {/* Meta and Date */}
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10px] text-on-surface-variant/60">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3.5 h-3.5 text-secondary" />
                                                    {formatDateTime(item.completedAt)}
                                                </span>
                                                <span className="w-1 h-1 bg-on-surface-variant/20 rounded-full" />
                                                <span className="flex items-center gap-1 font-semibold text-secondary">
                                                    <BookOpen className="w-3 h-3" />
                                                    {getFriendlyDocumentTitle(item.documentTitle)}
                                                </span>
                                            </div>

                                            {/* Title */}
                                            <h3 className="font-display text-base font-bold text-on-surface leading-snug">
                                                {formatQuizSetTitle(item.quizSetTitle)}
                                            </h3>
                                        </div>

                                        {/* Status and Action Panel */}
                                        <div className="flex items-center gap-6 self-end md:self-auto">
                                            {/* Score and XP Details */}
                                            <div className="text-right flex flex-col items-end">
                                                <span className="text-xs text-on-surface-variant">Kết quả</span>
                                                <span className="text-base font-bold text-on-surface font-display mt-0.5">
                                                    {item.score} <span className="text-xs text-on-surface-variant/60 font-normal">/ {item.totalQuestions}</span>
                                                </span>
                                                <span className={`text-[10px] font-bold mt-1 ${item.xpGained >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                    {item.xpGained >= 0 ? `+${item.xpGained}` : item.xpGained} XP
                                                </span>
                                            </div>

                                            {/* Status Badge */}
                                            <div className="w-20 text-center">
                                                {isPassed ? (
                                                    <span className="inline-block px-2.5 py-1 bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-wider rounded-full">
                                                        Đạt
                                                    </span>
                                                ) : (
                                                    <span className="inline-block px-2.5 py-1 bg-yellow-500/10 text-yellow-500 text-[10px] font-bold uppercase tracking-wider rounded-full">
                                                        Chưa đạt
                                                    </span>
                                                )}
                                            </div>

                                            {/* Replay Button */}
                                            {item.quizSetId && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/review/play/${item.quizSetId}`);
                                                    }}
                                                    className="flex items-center justify-center p-2.5 bg-secondary/10 hover:bg-secondary/20 active:bg-secondary/30 text-secondary rounded-lg transition-colors group"
                                                    title="Làm lại đề thi này"
                                                >
                                                    <RefreshCw className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Quiz Detail Modal */}
                {modalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm transition-opacity">
                        <div 
                            className="bg-surface-container border border-outline-variant/20 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-outline-variant/10 flex items-start justify-between gap-4 bg-surface-container-high/40">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-[10px] text-secondary font-semibold uppercase tracking-wider">
                                        <BookOpen className="w-3.5 h-3.5" />
                                        <span>{modalData ? getFriendlyDocumentTitle(modalData.documentTitle) : 'Tài liệu ôn tập'}</span>
                                    </div>
                                    <h3 className="font-display text-xl font-bold text-on-surface mt-1">
                                        {modalData ? formatQuizSetTitle(modalData.quizSetTitle) : 'Chi tiết bài làm'}
                                    </h3>
                                    
                                    {modalData && (
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-on-surface-variant/80 mt-2 font-medium">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-primary" />
                                                {formatDateTime(modalData.completedAt)}
                                            </span>
                                            <span className="w-1.5 h-1.5 bg-on-surface-variant/20 rounded-full" />
                                            <span className="flex items-center gap-1.5">
                                                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                                                Kết quả: <strong className="text-on-surface font-semibold">{modalData.score} / {modalData.totalQuestions}</strong> ({Math.round((modalData.score / modalData.totalQuestions) * 100)}%)
                                            </span>
                                            <span className="w-1.5 h-1.5 bg-on-surface-variant/20 rounded-full" />
                                            <span className={`flex items-center gap-1 font-bold ${modalData.xpGained >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                {modalData.xpGained >= 0 ? `+${modalData.xpGained}` : modalData.xpGained} XP
                                            </span>
                                        </div>
                                    )}
                                </div>
                                
                                <button 
                                    onClick={() => setModalOpen(false)}
                                    className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-highest border border-outline-variant/10 text-on-surface-variant hover:text-on-surface transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            {/* Modal Body */}
                            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6 flex-grow">
                                {modalLoading ? (
                                    <div className="flex flex-col items-center justify-center py-24">
                                        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                                        <p className="text-xs text-on-surface-variant">Đang tải chi tiết bài làm của bạn...</p>
                                    </div>
                                ) : modalError ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <AlertTriangle className="w-12 h-12 text-red-500/80 mb-4" />
                                        <p className="text-sm font-semibold text-on-surface mb-2">{modalError}</p>
                                        <button
                                            onClick={() => selectedSubmission ? handleOpenReview(selectedSubmission) : null}
                                            className="px-4 py-2 bg-secondary text-on-secondary text-xs font-bold rounded-lg"
                                        >
                                            Thử lại
                                        </button>
                                    </div>
                                ) : modalData ? (
                                    <div className="space-y-6">
                                        {modalData.questions.map((q, idx) => {
                                            const typeLabels = {
                                                MULTIPLE_CHOICE: 'Trắc nghiệm một lựa chọn',
                                                TRUE_FALSE: 'Đúng / Sai',
                                                SCENARIO: 'Tình huống thực tế',
                                                FILL_IN_THE_BLANK: 'Điền vào chỗ trống',
                                                MATCHING: 'Ghép cặp câu hỏi',
                                                TIMELINE: 'Sắp xếp dòng thời gian'
                                            };
                                            
                                            return (
                                                <div 
                                                    key={q.quizId} 
                                                    className="p-5 bg-surface-container-low border border-outline-variant/10 rounded-xl space-y-4 shadow-sm"
                                                >
                                                    {/* Question Header */}
                                                    <div className="flex items-center justify-between gap-3">
                                                        <span className="inline-block px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded-md">
                                                            Câu {idx + 1} • {typeLabels[q.quizType] || q.quizType}
                                                        </span>
                                                        
                                                        {q.isCorrect ? (
                                                            <span className="flex items-center gap-1 text-[11px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
                                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                                Chính xác
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center gap-1 text-[11px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">
                                                                <XCircle className="w-3.5 h-3.5" />
                                                                Chưa chính xác
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Question Text */}
                                                    <p className="font-display font-medium text-sm text-on-surface leading-relaxed">
                                                        {q.questionText}
                                                    </p>
                                                    
                                                    {/* Answer Rendering based on type */}
                                                    <div className="mt-4">
                                                        {renderQuestionAnswers(q)}
                                                    </div>
                                                    
                                                    {/* Explanation */}
                                                    {q.explanation && (
                                                        <div className="bg-primary/5 border-l-2 border-primary/45 p-3.5 rounded-r-xl text-xs text-on-surface-variant flex items-start gap-2.5 leading-relaxed mt-4">
                                                            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                                            <div>
                                                                <strong className="text-primary font-semibold block mb-0.5">Giải thích chi tiết:</strong>
                                                                {q.explanation}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : null}
                            </div>
                            
                            {/* Modal Footer */}
                            <div className="p-4 border-t border-outline-variant/10 flex justify-end bg-surface-container-high/20">
                                <button
                                    onClick={() => setModalOpen(false)}
                                    className="px-5 py-2.5 bg-secondary text-on-secondary text-xs font-bold rounded-lg hover:shadow-md transition-shadow"
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <Footer />
            </main>
        </div>
    );
}
