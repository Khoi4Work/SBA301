import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar.jsx';
import apiClient from '@/services/apiClient.js';
import { fetchDocuments, getFileTypeInfo, formatFileSize } from '@/services/documentService.js';
import { FileText, Award, Calendar, ChevronRight, Sparkles, RefreshCw, Loader2, BookOpen, ChevronDown, Search } from 'lucide-react';
import { getChapterDisplayName, getSectionDisplayName, getPartDisplayName } from '@/utils/curriculumMapping';
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

    // State cho bộ lọc cấu trúc giống trang Học viện
    const [selectedCurriculum, setSelectedCurriculum] = useState('GIÁO TRÌNH TRIẾT HỌC MÁC - LÊNIN');
    const [activeChapter, setActiveChapter] = useState('');
    const [activeSection, setActiveSection] = useState('Tất cả');
    const [isCurriculumOpen, setIsCurriculumOpen] = useState(false);

    // Fetch all documents from S3
    useEffect(() => {
        const loadDocs = async () => {
            try {
                const data = await fetchDocuments();
                setDocuments(data);
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
        if (!doc) return;
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

    // 1. Phân tích cấu trúc 5 cấp từ tên file
    const parsedDocs = useMemo(() => {
        return documents.map((doc) => {
            const name = doc.fileName || doc.title || '';
            
            const chapterMatch = name.match(/Chương\s*(\d+)/i);
            const parsedChapter = chapterMatch ? `Chương ${chapterMatch[1]}` : null;

            const sectionMatch = name.match(/Chương\s*\d+\s*-\s*([IVXLCDM]+)/i);
            const parsedSection = sectionMatch ? sectionMatch[1].toUpperCase() : null;

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

    // 2. Lấy danh sách các giáo trình
    const curricula = useMemo(() => {
        const set = new Set();
        documents.forEach((doc) => {
            if (doc.category && doc.category.trim() !== '' && doc.category !== 'Tài liệu ôn tập') {
                const cat = doc.category.trim();
                const isChapterName = /^Chương\s*\d+/i.test(cat) || /^Chuong\s*\d+/i.test(cat);
                if (!isChapterName) {
                    set.add(cat);
                }
            }
        });
        set.add('GIÁO TRÌNH TRIẾT HỌC MÁC - LÊNIN');
        return Array.from(set);
    }, [documents]);

    // 3. Lọc tài liệu theo giáo trình
    const curriculumDocs = useMemo(() => {
        if (!selectedCurriculum) return [];
        return parsedDocs.filter((doc) => {
            const matchesCategory = doc.category === selectedCurriculum;
            const matchesFallback =
                selectedCurriculum === 'GIÁO TRÌNH TRIẾT HỌC MÁC - LÊNIN' &&
                (doc.fileName?.toLowerCase()?.includes('chương') ||
                    doc.fileName?.toLowerCase()?.includes('chuong') ||
                    doc.title?.toLowerCase()?.includes('chương') ||
                    doc.title?.toLowerCase()?.includes('chuong'));

            return matchesCategory || matchesFallback;
        });
    }, [parsedDocs, selectedCurriculum]);

    // 4. Lấy danh sách các chương
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

    // Tự động chọn chương đầu tiên
    useEffect(() => {
        if (chapters.length > 0) {
            setActiveChapter(chapters[0]);
        } else {
            setActiveChapter('');
        }
    }, [selectedCurriculum, chapters]);

    // 5. Lấy danh sách mục La Mã
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

    // Tự động chọn mục La Mã đầu tiên
    useEffect(() => {
        if (sections.length > 0) {
            setActiveSection(sections[0]);
        } else {
            setActiveSection('Tất cả');
        }
    }, [sections]);

    // 6. Lọc tài liệu theo bộ lọc và tìm kiếm
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

    // Tự động chọn tài liệu đầu tiên hiển thị trong bộ lọc
    useEffect(() => {
        if (filteredDocs.length > 0) {
            const stillSelected = filteredDocs.some(d => d.key === selectedDoc?.key);
            if (!stillSelected) {
                handleSelectDoc(filteredDocs[0]);
            }
        } else {
            setSelectedDoc(null);
        }
    }, [filteredDocs]);

    // 7. Nhóm tài liệu theo Phần số
    const groupedDocs = useMemo(() => {
        const groups = {};
        filteredDocs.forEach((doc) => {
            const numSec = doc.parsedNumberSection || 'Khác';
            if (!groups[numSec]) {
                groups[numSec] = [];
            }
            groups[numSec].push(doc);
        });

        Object.keys(groups).forEach((key) => {
            groups[key].sort((a, b) => {
                const letterA = a.parsedLetterSection || '';
                const letterB = b.parsedLetterSection || '';
                return letterA.localeCompare(letterB);
            });
        });

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
                        <p className="text-on-surface-variant mt-2 text-sm max-w-2xl leading-relaxed">
                            Chọn tài liệu ôn tập để làm bài luyện tập. AI sẽ hỗ trợ biên soạn 20 câu hỏi bao gồm đầy đủ 6 thể loại kiểm tra để kiểm tra toàn diện kiến thức của bạn.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                        {/* Left Column: Documents List */}
                        <div className="xl:col-span-5 space-y-6">
                            <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-6 relative">
                                <div className="absolute inset-0 paper-texture pointer-events-none rounded-xl" />
                                <h3 className="font-display text-lg font-bold text-on-surface mb-4">Danh sách tài liệu</h3>
                                
                                {/* 1. Dropdown Chọn Giáo trình */}
                                <div className="relative inline-block text-left w-full mb-4 shrink-0">
                                    <label className="block text-[10px] uppercase tracking-[0.2em] text-outline mb-1.5 font-bold">
                                        Giáo trình học tập
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setIsCurriculumOpen(!isCurriculumOpen)}
                                        className="w-full bg-surface-container-high px-4 py-2.5 border border-outline-variant/30 rounded text-xs font-semibold text-on-surface flex items-center justify-between hover:border-secondary/60 transition-all shadow-sm focus:outline-none cursor-pointer"
                                    >
                                        <div className="flex items-center gap-2.5 truncate">
                                            <BookOpen size={14} className="text-secondary shrink-0" />
                                            <span className="truncate">{selectedCurriculum}</span>
                                        </div>
                                        <ChevronDown size={12} className="text-outline shrink-0 transition-transform duration-300" style={{ transform: isCurriculumOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                                    </button>

                                    {isCurriculumOpen && (
                                        <>
                                            <div 
                                                className="fixed inset-0 z-30" 
                                                onClick={() => setIsCurriculumOpen(false)}
                                            />
                                            <div className="absolute left-0 mt-1 w-full bg-surface-container-high border border-outline-variant/40 rounded-lg shadow-xl z-40 py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                                                {curricula.map((cur) => (
                                                    <button
                                                        key={cur}
                                                        onClick={() => {
                                                            setSelectedCurriculum(cur);
                                                            setIsCurriculumOpen(false);
                                                        }}
                                                        className={`w-full px-4 py-2.5 text-left text-xs flex items-center gap-2 hover:bg-secondary/10 hover:text-secondary transition-all cursor-pointer ${
                                                            selectedCurriculum === cur 
                                                                ? 'bg-secondary/5 text-secondary font-bold' 
                                                                : 'text-on-surface-variant'
                                                        }`}
                                                    >
                                                        <BookOpen size={12} className={selectedCurriculum === cur ? 'text-secondary' : 'text-outline'} />
                                                        <span className="truncate">{cur}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* 2. Ô Tìm kiếm */}
                                <div className="relative mb-4">
                                    <label className="block text-[10px] uppercase tracking-[0.2em] text-outline mb-1.5 font-bold">
                                        Tìm kiếm tài liệu
                                    </label>
                                    <div className="relative">
                                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                                        <input
                                            type="text"
                                            placeholder="Tìm kiếm tài liệu..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-9 pr-8 py-2 bg-surface-container-high border border-outline-variant/30 rounded text-xs text-on-surface placeholder:text-outline-variant focus:outline-none focus:border-secondary/60 transition-all"
                                        />
                                        {searchQuery && (
                                            <button
                                                onClick={() => setSearchQuery('')}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-secondary transition-colors cursor-pointer"
                                            >
                                                <span className="material-symbols-outlined text-[14px]">close</span>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* 3. Danh sách Chương & Mục La Mã */}
                                {selectedCurriculum && chapters.length > 0 && (
                                    <div className="space-y-4 p-4 bg-surface-container-high/40 border border-outline-variant/20 rounded-lg mb-4">
                                        {/* Chapters selector */}
                                        <div className="space-y-1.5">
                                            <span className="text-[10px] uppercase tracking-[0.2em] text-outline font-bold block">
                                                Chương học tập
                                            </span>
                                            <div className="flex flex-wrap gap-2">
                                                {chapters.map((chap) => (
                                                    <button
                                                        key={chap}
                                                        onClick={() => setActiveChapter(chap)}
                                                        className={`px-3 py-1.5 text-[10px] font-bold tracking-wider rounded transition-all cursor-pointer ${
                                                            activeChapter === chap
                                                                ? 'bg-secondary text-on-secondary shadow border border-secondary'
                                                                : 'border border-outline-variant/60 text-on-surface-variant hover:border-secondary hover:text-secondary hover:bg-secondary/5'
                                                        }`}
                                                    >
                                                        {getChapterDisplayName(chap).replace(/:.*/, '')}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Sections selector */}
                                        {activeChapter && sections.length > 0 && (
                                            <div className="space-y-1.5 pt-3 border-t border-outline-variant/20">
                                                <span className="text-[10px] uppercase tracking-[0.2em] text-outline font-bold block">
                                                    Mục La Mã
                                                </span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {sections.map((sec) => (
                                                        <button
                                                            key={sec}
                                                            onClick={() => setActiveSection(sec)}
                                                            className={`px-3 py-1 text-[10px] font-bold tracking-wider rounded transition-all cursor-pointer ${
                                                                activeSection === sec
                                                                    ? 'bg-secondary/15 text-secondary border border-secondary/40 shadow-sm'
                                                                    : 'border border-outline-variant/40 text-on-surface-variant hover:border-secondary/40 hover:text-secondary hover:bg-secondary/5'
                                                            }`}
                                                        >
                                                            Mục {sec}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* 4. Grouped Documents List */}
                                {loadingDocs ? (
                                    <div className="flex flex-col items-center justify-center py-12 gap-3 text-outline">
                                        <Loader2 className="w-8 h-8 animate-spin" />
                                        <span className="text-xs">Đang tải tài liệu...</span>
                                    </div>
                                ) : filteredDocs.length === 0 ? (
                                    <div className="text-center py-12 text-outline text-sm">Chưa có tài liệu nào</div>
                                ) : (
                                    <div className="space-y-6 max-h-[450px] overflow-y-auto pr-1">
                                        {groupedDocs.map((group) => (
                                            <div key={group.numberSection} className="space-y-2">
                                                {group.numberSection !== 'Khác' ? (
                                                    <h4 className="text-xs text-secondary font-bold flex items-center gap-1.5">
                                                        <span className="w-1 h-3 bg-secondary rounded-full inline-block" />
                                                        {getPartDisplayName(activeChapter, activeSection, group.numberSection)}
                                                    </h4>
                                                ) : (
                                                    filteredDocs.some(d => d.parsedNumberSection) && (
                                                        <h4 className="text-xs text-outline font-bold flex items-center gap-1.5">
                                                            <span className="w-1 h-3 bg-outline rounded-full inline-block" />
                                                            Tài liệu khác
                                                        </h4>
                                                    )
                                                )}
                                                
                                                <div className="space-y-2">
                                                    {group.docs.map((doc) => {
                                                        const isSelected = selectedDoc?.key === doc.key;
                                                        const { icon, color } = getFileTypeInfo(doc.contentType);
                                                        return (
                                                            <button
                                                                key={doc.key}
                                                                onClick={() => handleSelectDoc(doc)}
                                                                className={`w-full text-left p-3.5 rounded-lg border transition-all duration-300 flex items-center gap-3 ${
                                                                    isSelected
                                                                        ? 'bg-secondary/10 border-secondary text-secondary'
                                                                        : 'bg-surface-container-high border-outline-variant/10 text-on-surface hover:border-secondary/40'
                                                                }`}
                                                            >
                                                                <span className={`material-symbols-outlined text-[24px] ${color} shrink-0`}>
                                                                    {icon}
                                                                </span>
                                                                <div className="flex-1 min-w-0">
                                                                    <h4 className="font-semibold text-xs leading-snug flex items-center gap-1.5 flex-wrap">
                                                                        <span>{doc.parsedLetterSection ? `Phần ${doc.parsedLetterSection}: ` : ''}{doc.title || doc.fileName}</span>
                                                                        {doc.isCompleted && (
                                                                            <span className="shrink-0 inline-flex items-center text-[7px] text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/15 px-1 py-0.5 rounded border border-emerald-500/20">
                                                                                Đã học
                                                                            </span>
                                                                        )}
                                                                    </h4>
                                                                </div>
                                                                <ChevronRight className={`w-3.5 h-3.5 text-outline transition-transform ${isSelected ? 'rotate-90 text-secondary' : ''} shrink-0`} />
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
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
                                                                {`Bộ đề số ${idx + 1}`}
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
