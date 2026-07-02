import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, FileText, RefreshCw, AlertTriangle, Search, CheckCircle2, ChevronDown } from 'lucide-react';
import {
    fetchDocuments,
    getFileTypeInfo,
    formatFileSize,
    formatDate,
} from '@/services/documentService.js';
import {
    getChapterDisplayName,
    getSectionDisplayName,
    getPartDisplayName,
} from '@/utils/curriculumMapping';

// ─── Skeleton Card ───────────────────────────────────────────────────────────
function SkeletonCard() {
    return (
        <div className="bg-surface-container-low border border-outline-variant/20 rounded overflow-hidden animate-pulse">
            <div className="h-48 bg-surface-container-highest" />
            <div className="p-6 space-y-3">
                <div className="h-4 bg-surface-container-highest rounded w-1/3" />
                <div className="h-6 bg-surface-container-highest rounded w-2/3" />
                <div className="h-4 bg-surface-container-highest rounded w-full" />
                <div className="h-4 bg-surface-container-highest rounded w-4/5" />
                <div className="mt-6 h-1 bg-surface-container-highest rounded-full" />
            </div>
            <div className="h-12 bg-surface-container-highest" />
        </div>
    );
}

// ─── File Icon Banner ─────────────────────────────────────────────────────────
function FileBanner({ contentType, fileName }) {
    const { icon, color } = getFileTypeInfo(contentType);
    // Chọn gradient nền theo loại file (dùng màu từ design system)
    const bgMap = {
        'picture_as_pdf': 'from-secondary-container to-surface-container-highest',
        'description': 'from-primary-container to-surface-container-highest',
        'article': 'from-surface-container-high to-surface-container-highest',
        'folder': 'from-surface-container-highest to-surface-container-high',
    };
    const bg = bgMap[icon] ?? bgMap['folder'];

    return (
        <div className={`relative h-48 bg-gradient-to-br ${bg} flex flex-col items-center justify-center gap-3 overflow-hidden`}>
            {/* Decorative background letter */}
            <div className="absolute -right-4 -top-4 text-[120px] opacity-5 font-bold select-none leading-none">
                {fileName?.charAt(0)?.toUpperCase() ?? 'F'}
            </div>
            <span className={`material-symbols-outlined text-[56px] ${color}`}>{icon}</span>
            <span className={`text-[10px] uppercase tracking-[0.25em] font-bold ${color} opacity-80`}>
                {getFileTypeInfo(contentType).label}
            </span>
        </div>
    );
}

// ─── Document Card ────────────────────────────────────────────────────────────
function DocumentCard({ doc }) {
    const navigate = useNavigate();

    const handleStartLesson = () => {
        navigate(`/study/lesson?key=${encodeURIComponent(doc.key)}`);
    };

    return (
        <div className="group bg-surface-container-low border border-outline-variant/20 relative flex flex-col h-full hover:border-secondary/40 transition-all duration-500 rounded overflow-hidden">
            <div className="absolute inset-0 paper-texture pointer-events-none" />

            {/* Completed Badge */}
            {doc.isCompleted && (
                <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/95 text-white rounded text-[10px] font-bold tracking-wider uppercase shadow-lg shadow-emerald-500/20 backdrop-blur-sm border border-emerald-400/30">
                    <CheckCircle2 size={12} />
                    Đã học
                </div>
            )}

            {/* Thumbnail / Cover Image from Cloudinary / File Banner */}
            {doc.imageUrl ? (
                <div className="relative h-48 overflow-hidden flex items-center justify-center bg-surface-container-highest">
                    <img 
                        src={doc.imageUrl} 
                        alt={doc.title || doc.fileName} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                </div>
            ) : (
                <FileBanner contentType={doc.contentType} fileName={doc.fileName} />
            )}

            {/* Card Body */}
            <div className="p-6 folio-border flex-1 flex flex-col">
                {/* Title (Prefix with Phần a, b... if available) */}
                <h3 className="font-display text-xl text-on-surface mb-1 font-semibold leading-snug line-clamp-2">
                    {doc.parsedLetterSection ? `Phần ${doc.parsedLetterSection}: ` : ''}{doc.title || doc.fileName}
                </h3>

                {/* Description */}
                {doc.description ? (
                    <p className="text-sm text-on-surface-variant mb-4 italic line-clamp-3 leading-relaxed">
                        {doc.description}
                    </p>
                ) : (
                    <p className="text-sm text-outline italic mb-4">Không có mô tả.</p>
                )}

                {/* Metadata */}
                <div className="mt-auto space-y-2">
                    <div className="text-xs text-outline">
                        Cập nhật: {formatDate(doc.lastModified)}
                    </div>
                </div>
            </div>

            {/* Start / Re-learn Lesson Button */}
            {doc.isCompleted ? (
                <button
                    onClick={handleStartLesson}
                    className="w-full py-4 bg-emerald-500/10 text-emerald-400 text-sm font-bold tracking-wider uppercase border-t border-outline-variant/20 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                    <CheckCircle2 size={14} />
                    Học lại
                </button>
            ) : (
                <button
                    onClick={handleStartLesson}
                    className="w-full py-4 bg-surface-container-high text-on-surface text-sm font-bold tracking-wider uppercase border-t border-outline-variant/20 hover:bg-secondary hover:text-on-secondary transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                    <BookOpen size={14} />
                    Bắt đầu học
                </button>
            )}
        </div>
    );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ query }) {
    return (
        <div className="col-span-full flex flex-col items-center justify-center py-24 text-center gap-4 text-on-surface-variant">
            <BookOpen size={48} className="text-outline opacity-40" />
            <p className="text-lg font-semibold text-on-surface">
                {query ? `Không tìm thấy tài liệu nào cho "${query}"` : 'Chưa có tài liệu nào trong kho.'}
            </p>
            <p className="text-sm text-outline max-w-sm">
                {query
                    ? 'Hãy thử tìm kiếm với từ khóa khác hoặc xem tất cả bộ sưu tập.'
                    : 'Tài liệu từ S3 sẽ xuất hiện tại đây sau khi được tải lên.'}
            </p>
        </div>
    );
}

// ─── Error State ──────────────────────────────────────────────────────────────
function ErrorState({ message, onRetry }) {
    return (
        <div className="col-span-full flex flex-col items-center justify-center py-24 text-center gap-4">
            <AlertTriangle size={48} className="text-red-400 opacity-70" />
            <p className="text-lg font-semibold text-on-surface">Không thể tải thư viện</p>
            <p className="text-sm text-on-surface-variant max-w-md">
                {message || 'Đã xảy ra lỗi khi kết nối đến máy chủ. Vui lòng kiểm tra kết nối và thử lại.'}
            </p>
            <button
                onClick={onRetry}
                className="mt-2 flex items-center gap-2 px-6 py-3 bg-secondary text-on-secondary text-sm font-bold tracking-wider uppercase rounded hover:opacity-90 transition-opacity cursor-pointer"
            >
                <RefreshCw size={14} />
                Thử lại
            </button>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LibrarySection() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // State cho bộ lọc mới
    const [selectedCurriculum, setSelectedCurriculum] = useState('GIÁO TRÌNH TRIẾT HỌC MÁC - LÊNIN');
    const [activeChapter, setActiveChapter] = useState('');
    const [activeSection, setActiveSection] = useState('Tất cả');

    // State quản lý việc mở/đóng dropdown giáo trình
    const [isCurriculumOpen, setIsCurriculumOpen] = useState(false);
    const [isChapterOpen, setIsChapterOpen] = useState(false);
    const [isSectionOpen, setIsSectionOpen] = useState(false);

    const loadDocuments = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchDocuments();
            setDocuments(data);
        } catch (err) {
            console.error('Failed to fetch documents:', err);
            setError(err.response?.data?.message || err.message || 'Lỗi không xác định');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDocuments();
    }, []);

    // 1. Phân tích cấu trúc 5 cấp từ tên file
    // Định dạng ví dụ: "Chương1-I-1b.docx" -> Chương: 1, Mục La Mã: I, Phần số: 1, Phần chữ: b
    const parsedDocs = useMemo(() => {
        return documents.map((doc) => {
            const name = doc.fileName || doc.title || '';
            
            // Tìm số chương (ví dụ: "Chương 1" hoặc "Chương1")
            const chapterMatch = name.match(/Chương\s*(\d+)/i);
            const parsedChapter = chapterMatch ? `Chương ${chapterMatch[1]}` : null;

            // Tìm mục La Mã (ví dụ: "Chương 1 - I - 1a" -> "I", hoặc "Chương1-II" -> "II")
            const sectionMatch = name.match(/Chương\s*\d+\s*-\s*([IVXLCDM]+)/i);
            const parsedSection = sectionMatch ? sectionMatch[1].toUpperCase() : null;

            // Tìm phần số và phần chữ (ví dụ: "Chương1-I-1b" -> phần số "1", phần chữ "b")
            // Regex khớp với: dấu gạch ngang thứ hai -> chữ số -> chữ cái tùy chọn
            const subSectionMatch = name.match(/Chương\s*\d+\s*-\s*[IVXLCDM]+\s*-\s*(\d+)([a-zđA-ZĐ]*)/i);
            const parsedNumberSection = subSectionMatch ? subSectionMatch[1] : null;
            const parsedLetterSection = subSectionMatch ? subSectionMatch[2] : null;

            return {
                ...doc,
                parsedChapter,
                parsedSection,
                parsedNumberSection,
                parsedLetterSection,
            };
        });
    }, [documents]);

    // 2. Lấy danh sách các giáo trình (curricula) duy nhất từ S3 categories
    const curricula = useMemo(() => {
        const set = new Set();
        documents.forEach((doc) => {
            if (doc.category && doc.category.trim() !== '' && doc.category !== 'Tài liệu ôn tập') {
                const cat = doc.category.trim();
                // Loại bỏ các category bị gán nhầm thành tên Chương (ví dụ: "Chương 1", "Chương 2", "Chuong...")
                const isChapterName = /^Chương\s*\d+/i.test(cat) || /^Chuong\s*\d+/i.test(cat);
                if (!isChapterName) {
                    set.add(cat);
                }
            }
        });
        // Luôn đảm bảo có giáo trình Mác - Lênin
        set.add('GIÁO TRÌNH TRIẾT HỌC MÁC - LÊNIN');
        return Array.from(set);
    }, [documents]);

    // 3. Lọc tài liệu thuộc giáo trình đang chọn
    const curriculumDocs = useMemo(() => {
        if (!selectedCurriculum) return [];
        return parsedDocs.filter((doc) => {
            const matchesCategory = doc.category === selectedCurriculum;
            // Fallback: Nếu chọn giáo trình Triết học Mác-Lênin, cho phép hiển thị các tài liệu chứa "chương" hoặc "chuong" trong tên/title 
            // phòng trường hợp category trong S3 chưa được cập nhật chính xác.
            const matchesFallback =
                selectedCurriculum === 'GIÁO TRÌNH TRIẾT HỌC MÁC - LÊNIN' &&
                (doc.fileName?.toLowerCase()?.includes('chương') ||
                    doc.fileName?.toLowerCase()?.includes('chuong') ||
                    doc.title?.toLowerCase()?.includes('chương') ||
                    doc.title?.toLowerCase()?.includes('chuong'));

            return matchesCategory || matchesFallback;
        });
    }, [parsedDocs, selectedCurriculum]);

    // 4. Lấy danh sách các chương của giáo trình đang chọn
    const chapters = useMemo(() => {
        const set = new Set();
        curriculumDocs.forEach((doc) => {
            if (doc.parsedChapter) {
                set.add(doc.parsedChapter);
            }
        });
        return Array.from(set).sort((a, b) => {
            const numA = parseInt(a.replace(/^\D+/g, ''));
            const numB = parseInt(b.replace(/^\D+/g, ''));
            return numA - numB;
        });
    }, [curriculumDocs]);

    // Tự động chọn chương đầu tiên khi giáo trình thay đổi hoặc danh sách chương thay đổi
    useEffect(() => {
        if (chapters.length > 0) {
            setActiveChapter(chapters[0]);
        } else {
            setActiveChapter('');
        }
    }, [selectedCurriculum, chapters]);

    // 5. Lấy danh sách các mục La Mã của chương đang chọn
    const sections = useMemo(() => {
        if (!activeChapter) return [];
        const set = new Set();
        curriculumDocs.forEach((doc) => {
            if (doc.parsedChapter === activeChapter && doc.parsedSection) {
                set.add(doc.parsedSection);
            }
        });
        const romanOrder = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
        return Array.from(set).sort((a, b) => {
            return romanOrder.indexOf(a) - romanOrder.indexOf(b);
        });
    }, [curriculumDocs, activeChapter]);

    // Tự động chọn mục La Mã đầu tiên khi đổi chương hoặc khi danh sách mục La Mã thay đổi
    useEffect(() => {
        if (sections.length > 0) {
            setActiveSection(sections[0]);
        } else {
            setActiveSection('Tất cả');
        }
    }, [sections]);

    // 6. Lọc tài liệu theo activeChapter, activeSection và searchQuery
    const filteredDocs = useMemo(() => {
        return curriculumDocs.filter((doc) => {
            const matchesChapter = !activeChapter || doc.parsedChapter === activeChapter;
            const matchesSection =
                !activeSection ||
                activeSection === 'Tất cả' ||
                doc.parsedSection === activeSection;

            const q = searchQuery.toLowerCase().trim();
            const matchesSearch =
                !q ||
                doc.title?.toLowerCase().includes(q) ||
                doc.fileName?.toLowerCase().includes(q) ||
                doc.description?.toLowerCase().includes(q);

            return matchesChapter && matchesSection && matchesSearch;
        });
    }, [curriculumDocs, activeChapter, activeSection, searchQuery]);

    // 7. Nhóm tài liệu theo Phần số (parsedNumberSection) và sắp xếp theo Phần chữ (parsedLetterSection)
    const groupedDocs = useMemo(() => {
        const groups = {};
        filteredDocs.forEach((doc) => {
            const numSec = doc.parsedNumberSection || 'Khác';
            if (!groups[numSec]) {
                groups[numSec] = [];
            }
            groups[numSec].push(doc);
        });

        // Sắp xếp các tài liệu trong mỗi nhóm theo thứ tự chữ cái của parsedLetterSection (a, b, c...)
        Object.keys(groups).forEach((key) => {
            groups[key].sort((a, b) => {
                const letterA = a.parsedLetterSection || '';
                const letterB = b.parsedLetterSection || '';
                return letterA.localeCompare(letterB);
            });
        });

        // Trả về danh sách các nhóm đã sắp xếp (các phần số được sắp xếp tăng dần 1, 2, 3...)
        return Object.keys(groups)
            .sort((a, b) => {
                if (a === 'Khác') return 1;
                if (b === 'Khác') return -1;
                return parseInt(a) - parseInt(b);
            })
            .map((key) => ({
                numberSection: key,
                docs: groups[key],
            }));
    }, [filteredDocs]);

    return (
        <section className="mb-20">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <h2 className="font-display text-5xl text-on-background font-bold tracking-tight">
                        Thư viện học giả
                    </h2>
                </div>
                <div className="flex items-center gap-3">
                    {/* Live counter */}
                    {!loading && !error && (
                        <span className="text-xs text-outline font-medium">
                            {filteredDocs.length}/{curriculumDocs.length} tài liệu
                        </span>
                    )}
                    {/* Refresh button */}
                    <button
                        onClick={loadDocuments}
                        disabled={loading}
                        className="flex items-center gap-2 bg-surface-container-high px-4 py-2 border border-outline-variant/30 rounded text-sm font-bold tracking-wider text-secondary hover:border-secondary/60 transition-all disabled:opacity-40 cursor-pointer"
                        title="Tải lại thư viện"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        {loading ? 'Đang tải...' : 'Tải lại'}
                    </button>
                </div>
            </div>

            {/* Filter controls row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {/* 1. Dropdown Chọn Giáo trình */}
                <div className="relative inline-block text-left w-full">
                    <label className="block text-xs uppercase tracking-[0.2em] text-outline mb-2 font-bold">
                        Giáo trình học tập
                    </label>
                    <button
                        type="button"
                        onClick={() => {
                            setIsCurriculumOpen(!isCurriculumOpen);
                            setIsChapterOpen(false);
                            setIsSectionOpen(false);
                        }}
                        className="w-full bg-surface-container-high px-4 py-3 border border-outline-variant/30 rounded text-sm font-semibold text-on-surface flex items-center justify-between hover:border-secondary/60 transition-all shadow-sm focus:outline-none cursor-pointer"
                    >
                        <div className="flex items-center gap-2.5 truncate">
                            <BookOpen size={16} className="text-secondary shrink-0" />
                            <span className="truncate">{selectedCurriculum}</span>
                        </div>
                        <ChevronDown size={14} className="text-outline shrink-0 transition-transform duration-300" style={{ transform: isCurriculumOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                    </button>

                    {isCurriculumOpen && (
                        <>
                            <div 
                                className="fixed inset-0 z-30" 
                                onClick={() => setIsCurriculumOpen(false)}
                            />
                            <div className="absolute left-0 mt-2 w-full bg-surface-container-high border border-outline-variant/40 rounded-lg shadow-xl z-40 py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                                {curricula.map((cur) => (
                                    <button
                                        key={cur}
                                        onClick={() => {
                                            setSelectedCurriculum(cur);
                                            setIsCurriculumOpen(false);
                                        }}
                                        className={`w-full px-4 py-3 text-left text-sm flex items-center gap-2 hover:bg-secondary/10 hover:text-secondary transition-all cursor-pointer ${
                                            selectedCurriculum === cur 
                                                ? 'bg-secondary/5 text-secondary font-bold' 
                                                : 'text-on-surface-variant'
                                        }`}
                                    >
                                        <BookOpen size={14} className={selectedCurriculum === cur ? 'text-secondary' : 'text-outline'} />
                                        <span className="truncate">{cur}</span>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* 2. Dropdown Chọn Chương */}
                <div className="relative inline-block text-left w-full">
                    <label className="block text-xs uppercase tracking-[0.2em] text-outline mb-2 font-bold">
                        Chương học tập
                    </label>
                    <button
                        type="button"
                        onClick={() => {
                            if (chapters.length > 0) {
                                setIsChapterOpen(!isChapterOpen);
                                setIsCurriculumOpen(false);
                                setIsSectionOpen(false);
                            }
                        }}
                        disabled={chapters.length === 0}
                        className="w-full bg-surface-container-high px-4 py-3 border border-outline-variant/30 rounded text-sm font-semibold text-on-surface flex items-center justify-between hover:border-secondary/60 transition-all shadow-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        <div className="flex items-center gap-2.5 truncate">
                            <BookOpen size={16} className="text-secondary shrink-0" />
                            <span className="truncate">
                                {chapters.length > 0 
                                    ? (activeChapter ? getChapterDisplayName(activeChapter) : 'Chọn chương') 
                                    : 'Không có chương'}
                            </span>
                        </div>
                        <ChevronDown size={14} className="text-outline shrink-0 transition-transform duration-300" style={{ transform: isChapterOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                    </button>

                    {isChapterOpen && chapters.length > 0 && (
                        <>
                            <div 
                                className="fixed inset-0 z-30" 
                                onClick={() => setIsChapterOpen(false)}
                            />
                            <div className="absolute left-0 mt-2 w-full bg-surface-container-high border border-outline-variant/40 rounded-lg shadow-xl z-40 py-1.5 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                                {chapters.map((chap) => (
                                    <button
                                        key={chap}
                                        onClick={() => {
                                            setActiveChapter(chap);
                                            setIsChapterOpen(false);
                                        }}
                                        className={`w-full px-4 py-3 text-left text-sm flex items-center gap-2 hover:bg-secondary/10 hover:text-secondary transition-all cursor-pointer ${
                                            activeChapter === chap 
                                                ? 'bg-secondary/5 text-secondary font-bold' 
                                                : 'text-on-surface-variant'
                                        }`}
                                    >
                                        <BookOpen size={14} className={activeChapter === chap ? 'text-secondary' : 'text-outline'} />
                                        <span className="truncate">{getChapterDisplayName(chap)}</span>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* 3. Dropdown Chọn Mục La Mã */}
                <div className="relative inline-block text-left w-full">
                    <label className="block text-xs uppercase tracking-[0.2em] text-outline mb-2 font-bold">
                        Mục học tập (La Mã)
                    </label>
                    <button
                        type="button"
                        onClick={() => {
                            if (activeChapter && sections.length > 0) {
                                setIsSectionOpen(!isSectionOpen);
                                setIsCurriculumOpen(false);
                                setIsChapterOpen(false);
                            }
                        }}
                        disabled={!activeChapter || sections.length === 0}
                        className="w-full bg-surface-container-high px-4 py-3 border border-outline-variant/30 rounded text-sm font-semibold text-on-surface flex items-center justify-between hover:border-secondary/60 transition-all shadow-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        <div className="flex items-center gap-2.5 truncate">
                            <FileText size={16} className="text-secondary shrink-0" />
                            <span className="truncate">
                                {!activeChapter 
                                    ? 'Chọn chương trước' 
                                    : (sections.length > 0 
                                        ? (activeSection === 'Tất cả' ? 'Tất cả' : getSectionDisplayName(activeChapter, activeSection)) 
                                        : 'Không có mục')}
                            </span>
                        </div>
                        <ChevronDown size={14} className="text-outline shrink-0 transition-transform duration-300" style={{ transform: isSectionOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                    </button>

                    {isSectionOpen && activeChapter && sections.length > 0 && (
                        <>
                            <div 
                                className="fixed inset-0 z-30" 
                                onClick={() => setIsSectionOpen(false)}
                            />
                            <div className="absolute left-0 mt-2 w-full bg-surface-container-high border border-outline-variant/40 rounded-lg shadow-xl z-40 py-1.5 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                                {/* Option Tất cả */}
                                <button
                                    onClick={() => {
                                        setActiveSection('Tất cả');
                                        setIsSectionOpen(false);
                                    }}
                                    className={`w-full px-4 py-3 text-left text-sm flex items-center gap-2 hover:bg-secondary/10 hover:text-secondary transition-all cursor-pointer ${
                                        activeSection === 'Tất cả' 
                                            ? 'bg-secondary/5 text-secondary font-bold' 
                                            : 'text-on-surface-variant'
                                    }`}
                                >
                                    <FileText size={14} className={activeSection === 'Tất cả' ? 'text-secondary' : 'text-outline'} />
                                    <span className="truncate">Tất cả</span>
                                </button>
                                {sections.map((sec) => (
                                    <button
                                        key={sec}
                                        onClick={() => {
                                            setActiveSection(sec);
                                            setIsSectionOpen(false);
                                        }}
                                        className={`w-full px-4 py-3 text-left text-sm flex items-center gap-2 hover:bg-secondary/10 hover:text-secondary transition-all cursor-pointer ${
                                            activeSection === sec 
                                                ? 'bg-secondary/5 text-secondary font-bold' 
                                                : 'text-on-surface-variant'
                                        }`}
                                    >
                                        <FileText size={14} className={activeSection === sec ? 'text-secondary' : 'text-outline'} />
                                        <span className="truncate">{getSectionDisplayName(activeChapter, sec)}</span>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* 4. Ô Tìm kiếm */}
                <div className="relative w-full">
                    <label className="block text-xs uppercase tracking-[0.2em] text-outline mb-2 font-bold">
                        Tìm kiếm tài liệu
                    </label>
                    <div className="relative">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" />
                        <input
                            type="text"
                            placeholder="Nhập từ khóa..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-surface-container-high border border-outline-variant/30 rounded text-sm text-on-surface placeholder:text-outline-variant focus:outline-none focus:border-secondary/60 transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-secondary transition-colors cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Document Grid grouped by Number Section */}
            <div className="space-y-12 relative">
                <div className="h-px w-[200%] -left-[50%] absolute bg-gradient-to-r from-transparent via-outline-variant/20 to-transparent -top-12" />

                {/* Loading Skeletons */}
                {loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </div>
                )}

                {/* Error State */}
                {!loading && error && (
                    <ErrorState message={error} onRetry={loadDocuments} />
                )}

                {/* Empty State */}
                {!loading && !error && groupedDocs.length === 0 && (
                    <EmptyState query={searchQuery} />
                )}

                {/* Grouped Document Cards */}
                {!loading && !error && groupedDocs.map((group) => (
                    <div key={group.numberSection} className="space-y-4">
                        {group.numberSection !== 'Khác' ? (
                            <h3 className="font-display text-xl text-secondary font-bold flex items-center gap-2">
                                <span className="w-1.5 h-5 bg-secondary rounded-full inline-block" />
                                {getPartDisplayName(activeChapter, activeSection, group.numberSection)}
                            </h3>
                        ) : (
                            filteredDocs.some(d => d.parsedNumberSection) && (
                                <h3 className="font-display text-xl text-outline font-bold flex items-center gap-2">
                                    <span className="w-1.5 h-5 bg-outline rounded-full inline-block" />
                                    Tài liệu khác
                                </h3>
                            )
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {group.docs.map((doc, i) => (
                                <DocumentCard key={doc.key ?? i} doc={doc} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
