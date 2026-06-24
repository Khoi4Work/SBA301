import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    BookOpen, Volume2, VolumeX, CheckCircle2, XCircle,
    ChevronRight, ChevronLeft, Trophy, RotateCcw,
    Loader2, ArrowLeft, Pause, Play, AlertTriangle
} from 'lucide-react';
import { fetchLessonContent, generateQuiz, speakText } from '@/services/sessionService.js';
import apiClient from '@/services/apiClient.js';
import '@/assets/styles/philoverse-study.css';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const CHUNK_SIZE = 1800; // ký tự mỗi chunk TTS
const STAGES = { READING: 'reading', QUIZ: 'quiz', RESULT: 'result' };

// ─── READING STAGE ────────────────────────────────────────────────────────────
function ReadingStage({ lesson, onComplete }) {
    const [audioChunks, setAudioChunks] = useState([]);
    const [currentChunk, setCurrentChunk] = useState(0);
    const [isLoadingAudio, setIsLoadingAudio] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioError, setAudioError] = useState(null);
    const [ttsStarted, setTtsStarted] = useState(false);
    const audioRef = useRef(null);

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

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
            {/* Content Panel */}
            <div className="lg:col-span-2">
                <div className="bg-surface-container-low border border-outline-variant/20 rounded-lg overflow-hidden">
                    <div className="px-8 py-5 border-b border-outline-variant/20 flex items-center gap-3">
                        <BookOpen size={18} className="text-secondary" />
                        <span className="text-sm font-bold tracking-wider uppercase text-secondary">
                            Nội dung bài học
                        </span>
                    </div>
                    <div className="p-8 max-h-[65vh] overflow-y-auto custom-scrollbar">
                        <div className="prose prose-invert max-w-none">
                            <pre className="whitespace-pre-wrap font-body text-base leading-relaxed text-on-surface-variant">
                                {content || 'Không có nội dung.'}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>

            {/* Audio Panel */}
            <div className="lg:col-span-1">
                <div className="sticky top-28 space-y-4">
                    <div className="bg-surface-container-low border border-outline-variant/20 rounded-lg overflow-hidden">
                        <div className="px-6 py-5 border-b border-outline-variant/20">
                            <span className="text-sm font-bold tracking-wider uppercase text-secondary flex items-center gap-2">
                                <Volume2 size={16} />
                                Nghe bài học
                            </span>
                        </div>
                        <div className="p-6 space-y-5">
                            {/* Audio element (ẩn) */}
                            <audio ref={audioRef} onEnded={handleAudioEnded} className="hidden" />

                            {/* Error */}
                            {audioError && (
                                <div className="flex items-start gap-2 text-sm text-on-surface-variant bg-surface-container-high p-3 rounded">
                                    <AlertTriangle size={14} className="text-secondary mt-0.5 shrink-0" />
                                    {audioError}
                                </div>
                            )}

                            {/* Start button */}
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
                                    {/* Progress */}
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

                                    {/* Controls */}
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

                            {/* Tip */}
                            <p className="text-xs text-outline leading-relaxed">
                                🎙️ Giọng đọc tiếng Việt tự nhiên. Bài học sẽ được đọc liên tục từng đoạn.
                            </p>
                        </div>
                    </div>

                    {/* Complete button */}
                    <button
                        onClick={onComplete}
                        className="w-full py-4 bg-secondary text-on-secondary font-bold tracking-wider uppercase text-sm rounded flex items-center justify-center gap-2 hover:brightness-110 transition-all active:scale-95 shadow-lg shadow-secondary/20"
                    >
                        Hoàn thành bài học
                        <ChevronRight size={16} />
                    </button>
                </div>
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
        <div className="max-w-2xl mx-auto">
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
        <div className="max-w-xl mx-auto text-center">
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
                <div className="w-px h-5 bg-outline-variant/40" />
                <span className="font-display text-lg text-secondary truncate max-w-md">
                    {lesson?.title ?? 'Đang tải...'}
                </span>

                {/* Stage indicator */}
                <div className="ml-auto flex items-center gap-2">
                    {[
                        { id: STAGES.READING, label: 'Bài học' },
                        { id: STAGES.QUIZ, label: 'Ôn tập' },
                        { id: STAGES.RESULT, label: 'Kết quả' },
                    ].map((s, i) => (
                        <div key={s.id} className="flex items-center gap-2">
                            <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full transition-all
                                ${stage === s.id ? 'bg-secondary text-on-secondary' : 'text-on-surface-variant'}`}>
                                <span className="opacity-60">{i + 1}.</span>
                                {s.label}
                            </div>
                            {i < 2 && <ChevronRight size={12} className="text-outline-variant" />}
                        </div>
                    ))}
                </div>
            </header>

            {/* Main Content */}
            <main className="pt-16 px-4 md:px-12 py-10 max-w-[1200px] mx-auto">

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
                        <ReadingStage lesson={lesson} onComplete={handleCompleteLesson} />
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
