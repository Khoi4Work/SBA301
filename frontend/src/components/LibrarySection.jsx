import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, FileText, RefreshCw, AlertTriangle, Search } from 'lucide-react';
import {
    fetchDocuments,
    getFileTypeInfo,
    formatFileSize,
    formatDate,
} from '@/services/documentService';

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

            {/* Thumbnail / File Banner */}
            <FileBanner contentType={doc.contentType} fileName={doc.fileName} />

            {/* Card Body */}
            <div className="p-6 folio-border flex-1 flex flex-col">
                {/* Title */}
                <h3 className="font-display text-xl text-on-surface mb-1 font-semibold leading-snug line-clamp-2">
                    {doc.title || doc.fileName}
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
                    <div className="flex items-center justify-between text-xs text-on-surface-variant">
                        <span className="flex items-center gap-1">
                            <FileText size={12} />
                            {doc.fileName}
                        </span>
                        <span>{formatFileSize(doc.fileSize)}</span>
                    </div>
                    <div className="text-xs text-outline">
                        Cập nhật: {formatDate(doc.lastModified)}
                    </div>
                </div>
            </div>

            {/* Start Lesson Button */}
            <button
                onClick={handleStartLesson}
                className="w-full py-4 bg-surface-container-high text-on-surface text-sm font-bold tracking-wider uppercase border-t border-outline-variant/20 hover:bg-secondary hover:text-on-secondary transition-all flex items-center justify-center gap-2"
            >
                <BookOpen size={14} />
                Bắt đầu học
            </button>
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
                className="mt-2 flex items-center gap-2 px-6 py-3 bg-secondary text-on-secondary text-sm font-bold tracking-wider uppercase rounded hover:opacity-90 transition-opacity"
            >
                <RefreshCw size={14} />
                Thử lại
            </button>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const CATEGORIES = ['Tất cả bộ sưu tập', 'PDF', 'Markdown', 'Text'];

export default function LibrarySection() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState('Tất cả bộ sưu tập');
    const [searchQuery, setSearchQuery] = useState('');

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

    // Filter theo category và search query
    const filteredDocs = useMemo(() => {
        return documents.filter((doc) => {
            const matchesCategory =
                activeCategory === 'Tất cả bộ sưu tập' ||
                (activeCategory === 'PDF' && doc.contentType?.includes('pdf')) ||
                (activeCategory === 'Markdown' && (doc.contentType?.includes('markdown') || doc.fileName?.endsWith('.md'))) ||
                (activeCategory === 'Text' && doc.contentType?.includes('text') && !doc.contentType?.includes('markdown'));

            const q = searchQuery.toLowerCase();
            const matchesSearch =
                !q ||
                doc.title?.toLowerCase().includes(q) ||
                doc.fileName?.toLowerCase().includes(q) ||
                doc.description?.toLowerCase().includes(q);

            return matchesCategory && matchesSearch;
        });
    }, [documents, activeCategory, searchQuery]);

    return (
        <section className="mb-20">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    {/*<span className="text-xs uppercase tracking-[0.3em] text-secondary mb-2 block font-medium">*/}
                    {/*    Tri thức chọn lọc*/}
                    {/*</span>*/}
                    <h2 className="font-display text-5xl text-on-background font-bold tracking-tight">
                        Thư viện học giả
                    </h2>
                </div>
                <div className="flex items-center gap-3">
                    {/* Live counter */}
                    {!loading && !error && (
                        <span className="text-xs text-outline font-medium">
                            {filteredDocs.length}/{documents.length} tài liệu
                        </span>
                    )}
                    {/* Refresh button */}
                    <button
                        onClick={loadDocuments}
                        disabled={loading}
                        className="flex items-center gap-2 bg-surface-container-high px-4 py-2 border border-outline-variant/30 rounded text-sm font-bold tracking-wider text-secondary hover:border-secondary/60 transition-all disabled:opacity-40"
                        title="Tải lại thư viện"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        {loading ? 'Đang tải...' : 'Tải lại'}
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" />
                <input
                    type="text"
                    placeholder="Tìm kiếm tài liệu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-surface-container-high border border-outline-variant/30 rounded text-sm text-on-surface placeholder:text-outline-variant focus:outline-none focus:border-secondary/60 transition-all"
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-secondary transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                )}
            </div>

            {/* Category Filter */}
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-4 mb-8">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-5 py-2 text-sm font-bold tracking-wider whitespace-nowrap rounded transition-all ${
                            activeCategory === cat
                                ? 'bg-secondary text-on-secondary'
                                : 'border border-outline-variant text-on-surface-variant hover:border-secondary hover:text-secondary'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Document Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 relative">
                <div className="h-px w-[200%] -left-[50%] absolute bg-gradient-to-r from-transparent via-outline-variant/20 to-transparent -top-12" />

                {/* Loading Skeletons */}
                {loading && (
                    <>
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </>
                )}

                {/* Error State */}
                {!loading && error && (
                    <ErrorState message={error} onRetry={loadDocuments} />
                )}

                {/* Empty State */}
                {!loading && !error && filteredDocs.length === 0 && (
                    <EmptyState query={searchQuery} />
                )}

                {/* Document Cards */}
                {!loading && !error && filteredDocs.map((doc, i) => (
                    <DocumentCard key={doc.key ?? i} doc={doc} />
                ))}
            </div>
        </section>
    );
}
