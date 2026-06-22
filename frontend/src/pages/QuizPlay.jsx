import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '@/services/apiClient';
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Award, RefreshCw, Clock, Loader2, Info } from 'lucide-react';
import '@/assets/styles/philoverse-study.css';

export default function QuizPlay() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [quizSet, setQuizSet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    
    // User answers storage
    // Format: { quizId: { selectedOptionId, blankText, matches: [{left, right}], orderedOptionIds } }
    const [userAnswers, setUserAnswers] = useState({});

    // Matching UI temporary state
    const [selectedLeft, setSelectedLeft] = useState(null);
    const [selectedRight, setSelectedRight] = useState(null);

    // Results state
    const [results, setResults] = useState(null);

    // Timer state
    const [timeLeft, setTimeLeft] = useState(1500); // 25 minutes

    // Fetch quiz set details
    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const response = await apiClient.get(`/quiz-sets/${id}`);
                const data = response.data?.result;
                setQuizSet(data);
                
                // Initialize answers state
                const initialAnswers = {};
                data.questions.forEach((q) => {
                    if (q.quizType === 'TIMELINE') {
                        // For timeline, initial answer is the shuffled options order
                        initialAnswers[q.quizId] = {
                            orderedOptionIds: q.options.map(o => o.optionId)
                        };
                    } else if (q.quizType === 'MATCHING') {
                        initialAnswers[q.quizId] = {
                            matches: []
                        };
                    } else {
                        initialAnswers[q.quizId] = {
                            selectedOptionId: null,
                            blankText: '',
                            matches: []
                        };
                    }
                });
                setUserAnswers(initialAnswers);
            } catch (err) {
                console.error('Failed to load quiz details:', err);
                alert('Không thể tải bộ đề ôn tập này.');
                navigate('/review');
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id, navigate]);

    // Timer countdown
    useEffect(() => {
        if (loading || results || timeLeft <= 0) return;
        const interval = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [loading, results, timeLeft]);

    // Auto submit on timeout
    useEffect(() => {
        if (timeLeft === 0 && !results) {
            handleSubmit();
        }
    }, [timeLeft]);

    // Format timer
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3 text-outline">
                <Loader2 className="w-10 h-10 animate-spin text-secondary" />
                <span>Đang tải đề thi ôn tập...</span>
            </div>
        );
    }

    const questions = quizSet?.questions ?? [];
    const currentQuestion = questions[currentIndex];

    // Handle normal selections (Multiple Choice, True/False, Scenario)
    const handleSelectOption = (optionId) => {
        setUserAnswers(prev => ({
            ...prev,
            [currentQuestion.quizId]: {
                ...prev[currentQuestion.quizId],
                selectedOptionId: optionId
            }
        }));
    };

    // Handle Fill-in-the-blank text inputs
    const handleBlankChange = (text) => {
        setUserAnswers(prev => ({
            ...prev,
            [currentQuestion.quizId]: {
                ...prev[currentQuestion.quizId],
                blankText: text
            }
        }));
    };

    // Timeline swapping logic
    const handleTimelineMove = (index, direction) => {
        const answer = userAnswers[currentQuestion.quizId];
        const list = [...answer.orderedOptionIds];
        if (direction === 'up' && index > 0) {
            const temp = list[index];
            list[index] = list[index - 1];
            list[index - 1] = temp;
        } else if (direction === 'down' && index < list.length - 1) {
            const temp = list[index];
            list[index] = list[index + 1];
            list[index + 1] = temp;
        }
        setUserAnswers(prev => ({
            ...prev,
            [currentQuestion.quizId]: {
                ...prev[currentQuestion.quizId],
                orderedOptionIds: list
            }
        }));
    };

    // Matching columns logic
    const handleMatchSelect = (type, item) => {
        if (type === 'left') {
            setSelectedLeft(item);
            if (selectedRight) {
                commitMatch(item, selectedRight);
            }
        } else {
            setSelectedRight(item);
            if (selectedLeft) {
                commitMatch(selectedLeft, item);
            }
        }
    };

    const commitMatch = (left, right) => {
        const currentAnswer = userAnswers[currentQuestion.quizId];
        // Check if left or right is already matched
        const updatedMatches = currentAnswer.matches.filter(
            m => m.left !== left && m.right !== right
        );
        updatedMatches.push({ left, right });

        setUserAnswers(prev => ({
            ...prev,
            [currentQuestion.quizId]: {
                ...prev[currentQuestion.quizId],
                matches: updatedMatches
            }
        }));
        setSelectedLeft(null);
        setSelectedRight(null);
    };

    const removeMatch = (matchIndex) => {
        const currentAnswer = userAnswers[currentQuestion.quizId];
        const updatedMatches = currentAnswer.matches.filter((_, idx) => idx !== matchIndex);
        setUserAnswers(prev => ({
            ...prev,
            [currentQuestion.quizId]: {
                ...prev[currentQuestion.quizId],
                matches: updatedMatches
            }
        }));
    };

    // Submit answers
    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            // Build body
            const answersPayload = Object.keys(userAnswers).map((qId) => {
                const ans = userAnswers[qId];
                return {
                    quizId: qId,
                    selectedOptionId: ans.selectedOptionId,
                    blankText: ans.blankText,
                    matches: ans.matches,
                    orderedOptionIds: ans.orderedOptionIds
                };
            });

            const response = await apiClient.post(`/quiz-sets/${id}/submit`, {
                answers: answersPayload
            });
            setResults(response.data?.result);
        } catch (err) {
            console.error('Failed to submit quiz:', err);
            alert('Lỗi khi nộp bài. Vui lòng kiểm tra kết nối mạng của bạn.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleExit = () => {
        if (results || window.confirm('Bạn có chắc chắn muốn thoát khỏi bộ đề thi? Tiến trình làm bài sẽ không được lưu.')) {
            navigate('/review');
        }
    };

    // Rendering matching pairs options helper
    const getLeftAndRightItems = (question) => {
        const lefts = [];
        const rights = [];
        question.options.forEach((opt) => {
            const parts = opt.optionText.split('|');
            if (parts.length === 2) {
                const lVal = parts[0].trim();
                const rVal = parts[1].trim();
                if (!lefts.includes(lVal)) lefts.push(lVal);
                if (!rights.includes(rVal)) rights.push(rVal);
            }
        });
        return { lefts, rights };
    };

    // Render interactive widgets according to QuizType
    const renderQuestionWidget = () => {
        const answer = userAnswers[currentQuestion.quizId];

        switch (currentQuestion.quizType) {
            case 'MULTIPLE_CHOICE':
            case 'SCENARIO':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        {currentQuestion.options.map((opt) => {
                            const isSelected = answer?.selectedOptionId === opt.optionId;
                            return (
                                <button
                                    key={opt.optionId}
                                    onClick={() => handleSelectOption(opt.optionId)}
                                    className={`p-5 text-left border rounded-xl font-medium transition-all duration-200 cursor-pointer hover:shadow-md ${
                                        isSelected
                                            ? 'bg-secondary/10 border-secondary text-secondary ring-1 ring-secondary'
                                            : 'bg-surface-container-high border-outline-variant/10 text-on-surface hover:border-secondary/40'
                                    }`}
                                >
                                    <span className="text-sm">{opt.optionText}</span>
                                </button>
                            );
                        })}
                    </div>
                );

            case 'TRUE_FALSE':
                return (
                    <div className="flex justify-center gap-6 mt-8">
                        {currentQuestion.options.map((opt) => {
                            const isSelected = answer?.selectedOptionId === opt.optionId;
                            const isTrue = opt.optionText.toLowerCase() === 'đúng' || opt.optionText.toLowerCase() === 'true';
                            const activeClass = isTrue
                                ? 'bg-green-500/10 border-green-500 text-green-500 ring-1 ring-green-500'
                                : 'bg-red-500/10 border-red-500 text-red-500 ring-1 ring-red-500';
                            
                            const hoverClass = isTrue ? 'hover:border-green-500/50' : 'hover:border-red-500/50';

                            return (
                                <button
                                    key={opt.optionId}
                                    onClick={() => handleSelectOption(opt.optionId)}
                                    className={`w-40 py-6 border rounded-2xl font-bold text-lg uppercase tracking-wider transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-2 ${
                                        isSelected
                                            ? activeClass
                                            : `bg-surface-container-high border-outline-variant/10 text-on-surface-variant ${hoverClass}`
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-[36px]">
                                        {isTrue ? 'check_circle' : 'cancel'}
                                    </span>
                                    {opt.optionText}
                                </button>
                            );
                        })}
                    </div>
                );

            case 'FILL_IN_THE_BLANK':
                return (
                    <div className="mt-8 max-w-md mx-auto">
                        <label className="block text-xs uppercase tracking-widest text-outline mb-2 font-bold">
                            Đáp án của bạn:
                        </label>
                        <input
                            type="text"
                            value={answer?.blankText || ''}
                            onChange={(e) => handleBlankChange(e.target.value)}
                            placeholder="Nhập câu trả lời vào đây..."
                            className="w-full px-5 py-4 bg-surface-container-high border border-outline-variant/20 rounded-xl text-base text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                            autoFocus
                        />
                    </div>
                );

            case 'TIMELINE':
                // List options according to the ordered sequence in userAnswers
                const orderedOpts = answer?.orderedOptionIds.map(
                    id => currentQuestion.options.find(o => o.optionId === id)
                ).filter(Boolean) || [];

                return (
                    <div className="mt-6 max-w-xl mx-auto space-y-3">
                        <div className="text-center text-xs text-outline mb-4">
                            Sử dụng các nút mũi tên để di chuyển sự kiện theo thứ tự thời gian tăng dần (từ xưa đến nay)
                        </div>
                        {orderedOpts.map((opt, idx) => (
                            <div
                                key={opt.optionId}
                                className="bg-surface-container-high border border-outline-variant/10 rounded-xl p-4 flex items-center justify-between gap-4 shadow-sm"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-full bg-secondary/10 text-secondary text-xs font-bold flex items-center justify-center">
                                        {idx + 1}
                                    </span>
                                    <span className="text-sm font-medium text-on-surface">{opt.optionText}</span>
                                </div>

                                <div className="flex items-center gap-1.5">
                                    <button
                                        disabled={idx === 0}
                                        onClick={() => handleTimelineMove(idx, 'up')}
                                        className="p-1.5 bg-surface-container-highest border border-outline-variant/20 rounded hover:text-secondary disabled:opacity-40 disabled:hover:text-outline cursor-pointer"
                                    >
                                        <ChevronLeft className="w-4 h-4 rotate-90" />
                                    </button>
                                    <button
                                        disabled={idx === orderedOpts.length - 1}
                                        onClick={() => handleTimelineMove(idx, 'down')}
                                        className="p-1.5 bg-surface-container-highest border border-outline-variant/20 rounded hover:text-secondary disabled:opacity-40 disabled:hover:text-outline cursor-pointer"
                                    >
                                        <ChevronLeft className="w-4 h-4 -rotate-90" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                );

            case 'MATCHING':
                const { lefts, rights } = getLeftAndRightItems(currentQuestion);
                const currentMatches = answer?.matches ?? [];

                return (
                    <div className="mt-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                            {/* Left Column */}
                            <div className="space-y-3">
                                <h4 className="text-xs uppercase tracking-widest text-outline mb-2 font-bold text-center">Cột bên trái</h4>
                                {lefts.map((leftItem) => {
                                    const isSelected = selectedLeft === leftItem;
                                    const isMatched = currentMatches.some(m => m.left === leftItem);
                                    return (
                                        <button
                                            key={leftItem}
                                            disabled={isMatched}
                                            onClick={() => handleMatchSelect('left', leftItem)}
                                            className={`w-full p-4 border rounded-xl text-sm text-left transition-all duration-200 cursor-pointer ${
                                                isMatched
                                                    ? 'bg-surface-container-highest/30 border-transparent text-outline line-through cursor-not-allowed'
                                                    : isSelected
                                                        ? 'bg-secondary/15 border-secondary text-secondary ring-1 ring-secondary'
                                                        : 'bg-surface-container-high border-outline-variant/10 text-on-surface hover:border-secondary/30'
                                            }`}
                                        >
                                            {leftItem}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Right Column */}
                            <div className="space-y-3">
                                <h4 className="text-xs uppercase tracking-widest text-outline mb-2 font-bold text-center">Cột bên phải</h4>
                                {rights.map((rightItem) => {
                                    const isSelected = selectedRight === rightItem;
                                    const isMatched = currentMatches.some(m => m.right === rightItem);
                                    return (
                                        <button
                                            key={rightItem}
                                            disabled={isMatched}
                                            onClick={() => handleMatchSelect('right', rightItem)}
                                            className={`w-full p-4 border rounded-xl text-sm text-left transition-all duration-200 cursor-pointer ${
                                                isMatched
                                                    ? 'bg-surface-container-highest/30 border-transparent text-outline line-through cursor-not-allowed'
                                                    : isSelected
                                                        ? 'bg-secondary/15 border-secondary text-secondary ring-1 ring-secondary'
                                                        : 'bg-surface-container-high border-outline-variant/10 text-on-surface hover:border-secondary/30'
                                            }`}
                                        >
                                            {rightItem}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Matched list */}
                        {currentMatches.length > 0 && (
                            <div className="max-w-xl mx-auto bg-surface-container-high/40 border border-outline-variant/10 rounded-xl p-5 mt-6">
                                <h5 className="text-xs uppercase tracking-widest text-outline mb-3 font-bold">Các cặp đã ghép nối:</h5>
                                <div className="space-y-2">
                                    {currentMatches.map((m, idx) => (
                                        <div
                                            key={idx}
                                            className="bg-surface-container-highest border border-outline-variant/10 rounded-lg px-4 py-2 text-sm flex items-center justify-between"
                                        >
                                            <span>
                                                <strong className="text-secondary">{m.left}</strong>
                                                <span className="text-outline mx-2">⇆</span>
                                                <strong className="text-secondary">{m.right}</strong>
                                            </span>
                                            <button
                                                onClick={() => removeMatch(idx)}
                                                className="text-xs text-red-500 hover:underline cursor-pointer"
                                            >
                                                Hủy ghép
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    // Render results view when test is graded
    if (results) {
        const changeSign = results.xpGained >= 0 ? '+' : '';
        const xpColor = results.xpGained >= 0 ? 'text-green-500' : 'text-red-500';

        return (
            <div className="min-h-screen bg-surface px-4 md:px-12 py-16 selection:bg-secondary/30">
                <div className="max-w-[850px] mx-auto space-y-10">
                    
                    {/* Grade Score Card */}
                    <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-8 text-center relative shadow-lg overflow-hidden">
                        <div className="absolute inset-0 paper-texture pointer-events-none rounded-2xl" />
                        
                        <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Award className="w-10 h-10 text-secondary" />
                        </div>
                        
                        <h2 className="font-display text-4xl font-bold text-on-surface">Kết quả ôn tập</h2>
                        <p className="text-outline text-sm mt-1">{quizSet.title ? quizSet.title.replace(/:.*/, '') : ''}</p>
                        
                        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mt-8 border-t border-outline-variant/10 pt-6">
                            <div>
                                <span className="block text-[32px] font-bold text-on-surface">{results.score}/20</span>
                                <span className="text-[11px] text-outline uppercase tracking-wider font-bold">Số câu đúng</span>
                            </div>
                            <div>
                                <span className={`block text-[32px] font-bold ${xpColor}`}>{changeSign}{results.xpGained}</span>
                                <span className="text-[11px] text-outline uppercase tracking-wider font-bold">Điểm XP biến động</span>
                            </div>
                            <div>
                                <span className="block text-[32px] font-bold text-secondary">{results.newTotalXp}</span>
                                <span className="text-[11px] text-outline uppercase tracking-wider font-bold">Tổng XP mới</span>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/review')}
                            className="mt-8 px-8 py-3.5 bg-secondary text-on-secondary rounded-lg font-bold text-sm uppercase tracking-wider hover:opacity-95 transition-all shadow-md active:scale-98 cursor-pointer"
                        >
                            Quay lại trang Ôn tập
                        </button>
                    </div>

                    {/* Question details review list */}
                    <div className="space-y-6">
                        <h3 className="font-display text-xl font-bold text-on-surface flex items-center gap-2">
                            <Info className="w-5 h-5 text-secondary" />
                            Xem lại chi tiết bài làm
                        </h3>

                        {questions.map((q, idx) => {
                            const feedback = results.details.find(d => d.quizId === q.quizId);
                            const answer = userAnswers[q.quizId];
                            
                            return (
                                <div
                                    key={q.quizId}
                                    className={`bg-surface-container-low border border-outline-variant/10 rounded-xl p-6 relative`}
                                >
                                    <div className="absolute inset-0 paper-texture pointer-events-none rounded-xl" />
                                    
                                    {/* Question Header */}
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <div className="space-y-1">
                                            <span className="text-[10px] text-outline uppercase tracking-wider font-bold">
                                                Câu {idx + 1} • {q.quizType}
                                            </span>
                                            <h4 className="text-base font-semibold text-on-surface leading-snug">
                                                {q.questionText}
                                            </h4>
                                        </div>
                                        {feedback?.isCorrect ? (
                                            <div className="flex items-center gap-1 text-green-500 font-bold text-sm bg-green-500/10 px-3 py-1 rounded-full whitespace-nowrap">
                                                <CheckCircle2 className="w-4.5 h-4.5" />
                                                Chính xác
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 text-red-500 font-bold text-sm bg-red-500/10 px-3 py-1 rounded-full whitespace-nowrap">
                                                <XCircle className="w-4.5 h-4.5" />
                                                Chưa đúng
                                            </div>
                                        )}
                                    </div>

                                    {/* Display correct answers details */}
                                    <div className="bg-surface-container-high/40 rounded-xl p-4 space-y-3.5 mt-4 border border-outline-variant/10 text-sm">
                                        {/* User answer vs Correct answer summary */}
                                        {q.quizType === 'MULTIPLE_CHOICE' || q.quizType === 'TRUE_FALSE' || q.quizType === 'SCENARIO' ? (
                                            <div>
                                                <p className="text-xs text-outline mb-1.5 font-medium">Bạn đã chọn:</p>
                                                {(() => {
                                                    const selectedOpt = q.options.find(o => o.optionId === answer?.selectedOptionId);
                                                    return selectedOpt ? (
                                                        <span className={`font-semibold ${feedback?.isCorrect ? 'text-green-500' : 'text-red-500'} block mb-3`}>
                                                            {feedback?.isCorrect ? '✓' : '✗'} {selectedOpt.optionText}
                                                        </span>
                                                    ) : (
                                                        <span className="text-red-500 italic block mb-3">Chưa trả lời</span>
                                                    );
                                                })()}
                                                
                                                <p className="text-xs text-outline mb-1 font-medium">Đáp án đúng:</p>
                                                {q.options.filter(o => feedback?.correctOptionIds.includes(o.optionId)).map(o => (
                                                    <span key={o.optionId} className="font-semibold text-green-500 block">
                                                        ✓ {o.optionText}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : null}

                                        {q.quizType === 'FILL_IN_THE_BLANK' ? (
                                            <div>
                                                <p className="text-xs text-outline mb-1.5 font-medium">Bạn đã nhập:</p>
                                                {answer?.blankText ? (
                                                    <span className={`font-semibold ${feedback?.isCorrect ? 'text-green-500' : 'text-red-500'} block mb-3`}>
                                                        {feedback?.isCorrect ? '✓' : '✗'} "{answer.blankText}"
                                                    </span>
                                                ) : (
                                                    <span className="text-red-500 italic block mb-3">Chưa trả lời</span>
                                                )}

                                                <p className="text-xs text-outline mb-1 font-medium">Từ cần điền chính xác:</p>
                                                <span className="font-semibold text-green-500 block">
                                                    ✓ {feedback?.correctText}
                                                </span>
                                            </div>
                                        ) : null}

                                        {q.quizType === 'TIMELINE' ? (
                                            <div>
                                                <p className="text-xs text-outline mb-1.5 font-medium">Trình tự bạn đã sắp xếp:</p>
                                                <div className="space-y-1.5 mb-4">
                                                    {answer?.orderedOptionIds && answer.orderedOptionIds.length > 0 ? (
                                                        answer.orderedOptionIds.map((id, index) => {
                                                            const opt = q.options.find(o => o.optionId === id);
                                                            return (
                                                                <div key={id} className="flex items-center gap-2 text-xs">
                                                                    <span className="w-5 h-5 rounded-full bg-secondary/15 text-secondary font-bold flex items-center justify-center">
                                                                        {index + 1}
                                                                    </span>
                                                                    <span className="text-on-surface-variant">{opt?.optionText}</span>
                                                                </div>
                                                            );
                                                        })
                                                    ) : (
                                                        <span className="text-red-500 italic">Chưa trả lời</span>
                                                    )}
                                                </div>

                                                <p className="text-xs text-outline mb-1.5 font-medium">Trình tự dòng thời gian đúng:</p>
                                                <div className="space-y-1.5">
                                                    {feedback?.correctTimelineOrder.map((id, index) => {
                                                        const opt = q.options.find(o => o.optionId === id);
                                                        return (
                                                            <div key={id} className="flex items-center gap-2 text-xs">
                                                                <span className="w-5 h-5 rounded-full bg-green-500/10 text-green-500 font-bold flex items-center justify-center">
                                                                    {index + 1}
                                                                </span>
                                                                <span className="text-on-surface-variant">{opt?.optionText}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ) : null}

                                        {q.quizType === 'MATCHING' ? (
                                            <div>
                                                <p className="text-xs text-outline mb-1.5 font-medium">Các cặp bạn đã ghép:</p>
                                                {answer?.matches && answer.matches.length > 0 ? (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                                                        {answer.matches.map((pair, index) => (
                                                            <div key={index} className="bg-secondary/5 border border-secondary/10 rounded px-3 py-1.5 text-xs text-on-surface-variant">
                                                                <strong className="text-secondary">{pair.left?.trim()}</strong>
                                                                <span className="text-outline mx-2">⇆</span>
                                                                <strong className="text-secondary">{pair.right?.trim()}</strong>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-red-500 italic mb-4">Chưa ghép cặp nào</p>
                                                )}

                                                <p className="text-xs text-outline mb-1.5 font-medium">Các cặp ghép chính xác:</p>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {feedback?.correctPairs.map((pair, index) => {
                                                        const parts = pair.split('|');
                                                        return (
                                                            <div key={index} className="bg-green-500/5 border border-green-500/10 rounded px-3 py-1.5 text-xs text-on-surface-variant">
                                                                <strong className="text-green-500">{parts[0]?.trim()}</strong>
                                                                <span className="text-outline mx-2">⇆</span>
                                                                <strong className="text-green-500">{parts[1]?.trim()}</strong>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ) : null}

                                        {/* Explanation */}
                                        {q.explanation && (
                                            <div className="pt-3 border-t border-outline-variant/15 mt-3 text-xs text-on-surface-variant leading-relaxed italic">
                                                <strong>Giải thích:</strong> {q.explanation}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface text-on-surface flex flex-col">
            
            {/* Focused Test Header */}
            <header className="h-20 bg-surface-container-low border-b border-outline-variant/20 px-6 flex items-center justify-between sticky top-0 z-50">
                <button
                    onClick={handleExit}
                    className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer text-sm font-semibold"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Thoát
                </button>

                <div className="text-center">
                    <h3 className="font-display font-bold text-lg text-on-surface leading-tight">
                        {quizSet.title ? quizSet.title.replace(/:.*/, '') : ''}
                    </h3>
                    <span className="text-xs text-outline font-medium">
                        Câu {currentIndex + 1} trên {questions.length}
                    </span>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-lg text-secondary font-bold text-sm">
                    <Clock className="w-4 h-4" />
                    {formatTime(timeLeft)}
                </div>
            </header>

            {/* Progress Bar */}
            <div className="h-1 bg-surface-container-highest w-full">
                <div
                    className="h-full bg-secondary transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
            </div>

            {/* Central Question Layout */}
            <main className="flex-1 flex items-center justify-center p-6 md:p-12">
                <div className="max-w-[750px] w-full bg-surface-container-low border border-outline-variant/10 rounded-2xl p-8 relative shadow-md">
                    <div className="absolute inset-0 paper-texture pointer-events-none rounded-2xl" />

                    {/* Quiz Type Tag */}
                    <span className="inline-block px-3 py-1 bg-secondary/10 text-secondary text-[10px] font-bold uppercase tracking-wider rounded-full mb-4">
                        {currentQuestion.quizType}
                    </span>

                    {/* Question Content */}
                    <div className="space-y-4">
                        <h2 className="font-display text-xl md:text-2xl text-on-surface font-semibold leading-snug">
                            {currentQuestion.questionText}
                        </h2>
                    </div>

                    {/* Custom Formats Widgets */}
                    {renderQuestionWidget()}
                </div>
            </main>

            {/* Navigation Footer */}
            <footer className="h-20 bg-surface-container-low border-t border-outline-variant/20 px-6 flex items-center justify-between sticky bottom-0 z-50">
                <button
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex(prev => prev - 1)}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-surface-container-high border border-outline-variant/20 text-on-surface rounded font-semibold text-sm hover:border-secondary/40 transition-all disabled:opacity-40 cursor-pointer"
                >
                    <ChevronLeft className="w-5 h-5" />
                    Câu trước
                </button>

                {currentIndex === questions.length - 1 ? (
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex items-center gap-1.5 px-6 py-2.5 bg-secondary text-on-secondary rounded font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer shadow-md active:scale-98"
                    >
                        {submitting ? 'Đang nộp bài...' : 'Nộp bài thi'}
                    </button>
                ) : (
                    <button
                        onClick={() => setCurrentIndex(prev => prev + 1)}
                        className="flex items-center gap-1.5 px-5 py-2.5 bg-surface-container-high border border-outline-variant/20 text-on-surface rounded font-semibold text-sm hover:border-secondary/40 transition-all cursor-pointer"
                    >
                        Câu tiếp theo
                        <ChevronRight className="w-5 h-5" />
                    </button>
                )}
            </footer>

            {/* Full-screen Loading Overlay for grading */}
            {submitting && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[9999] flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-12 h-12 text-secondary animate-spin" />
                    <h3 className="font-display text-xl font-bold text-on-background">Đang chấm bài thi...</h3>
                    <p className="text-xs text-outline">Hệ thống đang đối chiếu đáp án và ghi nhận điểm XP.</p>
                </div>
            )}
        </div>
    );
}
