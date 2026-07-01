import React, { useState, useEffect, useMemo } from "react";
import Footer from "@/components/Footer.jsx";
import {
  fetchDocuments,
  uploadDocument,
  updateDocument,
  deleteDocument,
  formatFileSize,
  formatDate,
  getFileTypeInfo
} from "@/services/documentService.js";

export default function AcademyChaptersManagement() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter states
  const [selectedCurriculum, setSelectedCurriculum] = useState("Tất cả giáo trình");
  const [selectedChapter, setSelectedChapter] = useState("Tất cả chương");
  const [selectedSection, setSelectedSection] = useState("Tất cả mục La Mã");
  const [selectedNumberSection, setSelectedNumberSection] = useState("Tất cả phần số");
  const [selectedLetterSection, setSelectedLetterSection] = useState("Tất cả phần chữ");
  const [selectedFormat, setSelectedFormat] = useState("Tất cả định dạng");

  // Modal states
  const [modalMode, setModalMode] = useState(null); // "upload" | "edit" | "delete"
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [customUploadCategory, setCustomUploadCategory] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadImage, setUploadImage] = useState(null);

  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState("");

  // 1. Phân tích cấu trúc từ tên file
  const parsedDocs = useMemo(() => {
    return documents.map((doc) => {
      const name = doc.fileName || doc.title || '';

      const chapterMatch = name.match(/Chương\s*(\d+)/i);
      const parsedChapter = chapterMatch ? `Chương ${parseInt(chapterMatch[1], 10)}` : null;

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

  // 2. Lấy danh sách Giáo trình
  const curricula = useMemo(() => {
    const set = new Set();
    parsedDocs.forEach((doc) => {
      if (doc.category && doc.category.trim() !== '' && doc.category !== 'Tài liệu ôn tập') {
        const cat = doc.category.trim();
        // Loại bỏ các category bị gán nhầm thành tên Chương (ví dụ: "Chương 1", "Chương 2", "Chuong...")
        const isChapterName = /^Chương\s*\d+/i.test(cat) || /^Chuong\s*\d+/i.test(cat);
        if (!isChapterName) {
          set.add(cat);
        }
      }
    });
    return Array.from(set).sort();
  }, [parsedDocs]);

  // 2.5 Lấy danh sách Giáo trình cho việc tải lên
  const uploadCurriculaOptions = useMemo(() => {
    const list = new Set([
      "GIÁO TRÌNH TRIẾT HỌC MÁC - LÊNIN",
      "GIÁO TRÌNH KINH TẾ CHÍNH TRỊ MÁC - LÊNIN"
    ]);
    curricula.forEach(cat => {
      if (cat && cat !== "Tài liệu ôn tập") {
        list.add(cat);
      }
    });
    return Array.from(list);
  }, [curricula]);

  // 3. Lấy danh sách Chương khả dụng theo Giáo trình
  const availableChapters = useMemo(() => {
    const set = new Set();
    parsedDocs.forEach((doc) => {
      if (selectedCurriculum === "Tất cả giáo trình" || doc.category === selectedCurriculum) {
        if (doc.parsedChapter) {
          set.add(doc.parsedChapter);
        }
      }
    });
    return Array.from(set).sort((a, b) => {
      const numA = parseInt(a.replace(/^\D+/g, ''), 10);
      const numB = parseInt(b.replace(/^\D+/g, ''), 10);
      return numA - numB;
    });
  }, [parsedDocs, selectedCurriculum]);

  // 4. Lấy danh sách Mục La Mã khả dụng theo Chương
  const availableSections = useMemo(() => {
    const set = new Set();
    parsedDocs.forEach((doc) => {
      const matchCurriculum = selectedCurriculum === "Tất cả giáo trình" || doc.category === selectedCurriculum;
      const matchChapter = selectedChapter === "Tất cả chương" || doc.parsedChapter === selectedChapter;
      if (matchCurriculum && matchChapter && doc.parsedSection) {
        set.add(doc.parsedSection);
      }
    });
    return Array.from(set).sort();
  }, [parsedDocs, selectedCurriculum, selectedChapter]);

  // 5. Lấy danh sách Phần số khả dụng theo Mục La Mã
  const availableNumberSections = useMemo(() => {
    const set = new Set();
    parsedDocs.forEach((doc) => {
      const matchCurriculum = selectedCurriculum === "Tất cả giáo trình" || doc.category === selectedCurriculum;
      const matchChapter = selectedChapter === "Tất cả chương" || doc.parsedChapter === selectedChapter;
      const matchSection = selectedSection === "Tất cả mục La Mã" || doc.parsedSection === selectedSection;
      if (matchCurriculum && matchChapter && matchSection && doc.parsedNumberSection) {
        set.add(doc.parsedNumberSection);
      }
    });
    return Array.from(set).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  }, [parsedDocs, selectedCurriculum, selectedChapter, selectedSection]);

  // 6. Lấy danh sách Phần chữ khả dụng theo Phần số
  const availableLetterSections = useMemo(() => {
    const set = new Set();
    parsedDocs.forEach((doc) => {
      const matchCurriculum = selectedCurriculum === "Tất cả giáo trình" || doc.category === selectedCurriculum;
      const matchChapter = selectedChapter === "Tất cả chương" || doc.parsedChapter === selectedChapter;
      const matchSection = selectedSection === "Tất cả mục La Mã" || doc.parsedSection === selectedSection;
      const matchNumSection = selectedNumberSection === "Tất cả phần số" || doc.parsedNumberSection === selectedNumberSection;
      if (matchCurriculum && matchChapter && matchSection && matchNumSection && doc.parsedLetterSection) {
        set.add(doc.parsedLetterSection);
      }
    });
    return Array.from(set).sort();
  }, [parsedDocs, selectedCurriculum, selectedChapter, selectedSection, selectedNumberSection]);

  // Reset các bộ lọc con khi bộ lọc cha thay đổi
  useEffect(() => {
    setSelectedChapter("Tất cả chương");
  }, [selectedCurriculum]);

  useEffect(() => {
    setSelectedSection("Tất cả mục La Mã");
  }, [selectedChapter]);

  useEffect(() => {
    setSelectedNumberSection("Tất cả phần số");
  }, [selectedSection]);

  useEffect(() => {
    setSelectedLetterSection("Tất cả phần chữ");
  }, [selectedNumberSection]);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      setError("");
      const data = await fetchDocuments();
      setDocuments(data);
    } catch (err) {
      console.error(err);
      setError("Không tải được danh sách tài liệu học từ hệ thống.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const openUploadModal = () => {
    setModalMode("upload");
    setSelectedDoc(null);
    setFormTitle("");
    setFormDesc("");
    setFormCategory(uploadCurriculaOptions[0] || "GIÁO TRÌNH TRIẾT HỌC MÁC - LÊNIN");
    setCustomUploadCategory("");
    setUploadFile(null);
    setUploadImage(null);
    setModalError("");
  };

  const openEditModal = (doc) => {
    setModalMode("edit");
    setSelectedDoc(doc);
    setFormTitle(doc.title || "");
    setFormDesc(doc.description || "");
    const docCat = doc.category || "";
    if (uploadCurriculaOptions.includes(docCat)) {
      setFormCategory(docCat);
      setCustomUploadCategory("");
    } else {
      setFormCategory("other");
      setCustomUploadCategory(docCat);
    }
    setUploadFile(null);
    setUploadImage(null);
    setModalError("");
  };

  const openDeleteModal = (doc) => {
    setModalMode("delete");
    setSelectedDoc(doc);
    setModalError("");
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedDoc(null);
    setUploadFile(null);
    setUploadImage(null);
    setModalError("");
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setModalError("Vui lòng chọn tệp tin tài liệu (.pdf, .md hoặc .docx)");
      return;
    }

    const finalCategory = formCategory === "other" ? customUploadCategory.trim() : formCategory;
    if (!finalCategory) {
      setModalError("Vui lòng chọn hoặc nhập tên giáo trình.");
      return;
    }

    const formData = new FormData();
    formData.append("file", uploadFile);
    if (formTitle.trim()) formData.append("title", formTitle);
    if (formDesc.trim()) formData.append("description", formDesc);
    if (uploadImage) formData.append("image", uploadImage);
    formData.append("category", finalCategory);

    try {
      setSaving(true);
      setModalError("");
      await uploadDocument(formData);
      await loadDocuments();
      closeModal();
    } catch (err) {
      console.error(err);
      setModalError(err.response?.data?.message || "Tải lên tài liệu thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const finalCategory = formCategory === "other" ? customUploadCategory.trim() : formCategory;
    if (!finalCategory) {
      setModalError("Vui lòng chọn hoặc nhập tên giáo trình.");
      return;
    }

    const formData = new FormData();
    if (formTitle.trim()) formData.append("title", formTitle);
    if (formDesc.trim()) formData.append("description", formDesc);
    if (uploadImage) formData.append("image", uploadImage);
    formData.append("category", finalCategory);

    try {
      setSaving(true);
      setModalError("");
      await updateDocument(selectedDoc.key, formData);
      await loadDocuments();
      closeModal();
    } catch (err) {
      console.error(err);
      setModalError(err.response?.data?.message || "Cập nhật tài liệu thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setModalError("");
      await deleteDocument(selectedDoc.key);
      await loadDocuments();
      closeModal();
    } catch (err) {
      console.error(err);
      setModalError(err.response?.data?.message || "Xóa tài liệu thất bại.");
    } finally {
      setSaving(false);
    }
  };

  // Filtered documents search
  const filteredDocs = parsedDocs.filter((doc) => {
    // 1. Search Query Match
    const titleMatch = doc.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const fileMatch = doc.fileName?.toLowerCase().includes(searchQuery.toLowerCase());
    const categoryMatch = doc.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = titleMatch || fileMatch || categoryMatch;

    // 2. Curriculum Match
    const matchesCurriculum = selectedCurriculum === "Tất cả giáo trình" || doc.category === selectedCurriculum;

    // 3. Chapter Match
    const matchesChapter = selectedChapter === "Tất cả chương" || doc.parsedChapter === selectedChapter;

    // 4. Section Match
    const matchesSection = selectedSection === "Tất cả mục La Mã" || doc.parsedSection === selectedSection;

    // 5. Number Section Match
    const matchesNumSection = selectedNumberSection === "Tất cả phần số" || doc.parsedNumberSection === selectedNumberSection;

    // 6. Letter Section Match
    const matchesLetterSection = selectedLetterSection === "Tất cả phần chữ" || doc.parsedLetterSection === selectedLetterSection;

    // 7. Format Match
    let matchesFormat = true;
    if (selectedFormat !== "Tất cả định dạng") {
      const type = doc.contentType?.toLowerCase() || "";
      if (selectedFormat === "PDF") {
        matchesFormat = type.includes("pdf") || doc.fileName?.endsWith(".pdf");
      } else if (selectedFormat === "Markdown") {
        matchesFormat = type.includes("markdown") || type.includes("md") || doc.fileName?.endsWith(".md");
      } else if (selectedFormat === "Word") {
        matchesFormat = type.includes("word") || type.includes("officedocument") || doc.fileName?.endsWith(".docx") || doc.fileName?.endsWith(".doc");
      }
    }

    return matchesSearch && matchesCurriculum && matchesChapter && matchesSection && matchesNumSection && matchesLetterSection && matchesFormat;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredDocs.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDocs = filteredDocs.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="animate-fade-in pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <nav className="flex items-center text-[10px] font-semibold text-secondary/60 tracking-widest uppercase mb-3">
            <span>Học viện</span>
            <span className="material-symbols-outlined text-[12px] mx-2">chevron_right</span>
            <span>Quản lý học liệu</span>
          </nav>
          <h3 className="font-display text-4xl font-semibold text-on-surface">Danh Mục Tài Liệu Học</h3>
          <p className="text-on-surface-variant/70 mt-3 max-w-2xl">
            Quản lý kho học liệu cốt lõi trong hệ thống tri thức Philoverse. Các tài liệu được tải lên S3 phục vụ trực tiếp cho hoạt động tự học và luyện đề.
          </p>
        </div>
        <div>
          <button
            onClick={openUploadModal}
            className="bg-secondary text-on-secondary px-8 py-3 text-sm font-semibold uppercase tracking-widest border border-secondary hover:bg-transparent hover:text-secondary transition-all duration-500 shadow-lg shadow-secondary/10"
          >
            Tải lên tài liệu
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-12 gap-6 mb-12">
        <div className="col-span-12 md:col-span-8 bg-surface-container-low border border-secondary/10 p-gutter folio-border relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-6xl">auto_stories</span>
          </div>
          <p className="text-secondary font-semibold uppercase tracking-tighter text-xs mb-2">Tổng quan nội dung</p>
          <h4 className="font-display text-2xl font-semibold text-on-surface mb-6">
            {documents.length} Học Liệu Đã Tải Lên
          </h4>
          <div className="flex flex-wrap gap-x-8 gap-y-4">
            <div>
              <span className="block text-4xl font-display text-on-surface">
                {documents.filter(d => d.contentType?.includes("pdf") || d.fileName?.endsWith(".pdf")).length}
              </span>
              <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-widest mt-1">Tài liệu PDF</span>
            </div>
            <div>
              <span className="block text-4xl font-display text-on-surface">
                {documents.filter(d => d.contentType?.includes("markdown") || d.contentType?.includes("md") || d.fileName?.endsWith(".md")).length}
              </span>
              <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-widest mt-1">Tài liệu MD</span>
            </div>
            <div>
              <span className="block text-4xl font-display text-on-surface">
                {documents.filter(d => d.contentType?.includes("word") || d.contentType?.includes("officedocument") || d.fileName?.endsWith(".docx") || d.fileName?.endsWith(".doc")).length}
              </span>
              <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-widest mt-1">Tài liệu DOCX</span>
            </div>
            <div>
              <span className="block text-4xl font-display text-secondary">
                {formatFileSize(documents.reduce((acc, curr) => acc + (curr.fileSize || 0), 0))}
              </span>
              <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-widest mt-1">Tổng dung lượng</span>
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-4 bg-secondary-container/10 border border-secondary/20 p-gutter flex flex-col justify-between">
          <div>
            <p className="text-secondary font-semibold uppercase tracking-tighter text-xs mb-2">Trạng thái lưu trữ</p>
            <p className="text-on-surface text-sm italic">&quot;Tri thức là ngọn đèn duy nhất soi sáng bóng tối của sự vô tri.&quot;</p>
          </div>
          <div className="flex items-center space-x-2 text-secondary mt-6">
            <div className="w-2 h-2 rounded-full bg-secondary animate-pulse"></div>
            <span className="text-[11px] font-semibold uppercase tracking-widest">S3 Bucket: Active</span>
          </div>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="bg-surface-container-low border border-secondary/15 p-4 mb-6 space-y-4">
        {/* Row 1: Search & Format & Reset */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          <div className="relative flex items-center flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm tài liệu học theo tiêu đề, tên file..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="bg-surface-container-high border border-secondary/20 text-on-surface px-4 py-2.5 pl-10 focus:outline-none focus:border-secondary transition-colors w-full text-sm placeholder:text-on-surface-variant/40"
            />
            <span className="material-symbols-outlined absolute left-3 text-on-surface-variant/60 text-lg">
              search
            </span>
          </div>

          <div className="relative flex items-center w-full md:w-48">
            <select
              value={selectedFormat}
              onChange={(e) => { setSelectedFormat(e.target.value); setCurrentPage(1); }}
              className="bg-surface-container-high border border-secondary/20 text-on-surface px-4 py-2.5 pr-8 focus:outline-none focus:border-secondary transition-colors w-full text-sm appearance-none cursor-pointer"
            >
              <option value="Tất cả định dạng">Tất cả định dạng</option>
              <option value="PDF">PDF</option>
              <option value="Markdown">Markdown</option>
              <option value="Word">Word (DOCX)</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 pointer-events-none text-on-surface-variant/60 text-lg">
              arrow_drop_down
            </span>
          </div>

          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCurriculum("Tất cả giáo trình");
              setSelectedFormat("Tất cả định dạng");
              setCurrentPage(1);
              loadDocuments();
            }}
            className="p-2.5 border border-secondary/20 text-on-surface-variant hover:border-secondary hover:text-secondary transition-colors flex items-center justify-center gap-1 text-xs font-semibold uppercase tracking-wider bg-surface-container-high"
            title="Đặt lại bộ lọc"
          >
            <span className="material-symbols-outlined text-sm">restart_alt</span>
            <span>Đặt lại</span>
          </button>
        </div>

        {/* Row 2: 5-level Cascading Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-3 border-t border-secondary/10">
          {/* 1. Giáo trình */}
          <div className="relative flex items-center">
            <select
              value={selectedCurriculum}
              onChange={(e) => { setSelectedCurriculum(e.target.value); setCurrentPage(1); }}
              className="bg-surface-container-high border border-secondary/20 text-on-surface px-3 py-2 pr-8 focus:outline-none focus:border-secondary transition-colors w-full text-xs appearance-none cursor-pointer truncate"
            >
              <option value="Tất cả giáo trình">Tất cả giáo trình</option>
              {curricula.map(cur => (
                <option key={cur} value={cur}>{cur}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2 pointer-events-none text-on-surface-variant/60 text-lg">
              arrow_drop_down
            </span>
          </div>

          {/* 2. Chương */}
          <div className="relative flex items-center">
            <select
              value={selectedChapter}
              onChange={(e) => { setSelectedChapter(e.target.value); setCurrentPage(1); }}
              className="bg-surface-container-high border border-secondary/20 text-on-surface px-3 py-2 pr-8 focus:outline-none focus:border-secondary transition-colors w-full text-xs appearance-none cursor-pointer"
              disabled={selectedCurriculum === "Tất cả giáo trình" && availableChapters.length === 0}
            >
              <option value="Tất cả chương">Tất cả chương</option>
              {availableChapters.map(chap => (
                <option key={chap} value={chap}>{chap}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2 pointer-events-none text-on-surface-variant/60 text-lg">
              arrow_drop_down
            </span>
          </div>

          {/* 3. Mục La Mã */}
          <div className="relative flex items-center">
            <select
              value={selectedSection}
              onChange={(e) => { setSelectedSection(e.target.value); setCurrentPage(1); }}
              className="bg-surface-container-high border border-secondary/20 text-on-surface px-3 py-2 pr-8 focus:outline-none focus:border-secondary transition-colors w-full text-xs appearance-none cursor-pointer"
              disabled={selectedChapter === "Tất cả chương"}
            >
              <option value="Tất cả mục La Mã">Tất cả mục La Mã</option>
              {availableSections.map(sec => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2 pointer-events-none text-on-surface-variant/60 text-lg">
              arrow_drop_down
            </span>
          </div>

          {/* 4. Phần số */}
          <div className="relative flex items-center">
            <select
              value={selectedNumberSection}
              onChange={(e) => { setSelectedNumberSection(e.target.value); setCurrentPage(1); }}
              className="bg-surface-container-high border border-secondary/20 text-on-surface px-3 py-2 pr-8 focus:outline-none focus:border-secondary transition-colors w-full text-xs appearance-none cursor-pointer"
              disabled={selectedSection === "Tất cả mục La Mã"}
            >
              <option value="Tất cả phần số">Tất cả phần số</option>
              {availableNumberSections.map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2 pointer-events-none text-on-surface-variant/60 text-lg">
              arrow_drop_down
            </span>
          </div>

          {/* 5. Phần chữ */}
          <div className="relative flex items-center">
            <select
              value={selectedLetterSection}
              onChange={(e) => { setSelectedLetterSection(e.target.value); setCurrentPage(1); }}
              className="bg-surface-container-high border border-secondary/20 text-on-surface px-3 py-2 pr-8 focus:outline-none focus:border-secondary transition-colors w-full text-xs appearance-none cursor-pointer"
              disabled={selectedNumberSection === "Tất cả phần số"}
            >
              <option value="Tất cả phần chữ">Tất cả phần chữ</option>
              {availableLetterSections.map(letSec => (
                <option key={letSec} value={letSec}>{letSec}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2 pointer-events-none text-on-surface-variant/60 text-lg">
              arrow_drop_down
            </span>
          </div>
        </div>
      </div>

      {/* Data Table Section */}
      <div className="bg-surface-container-lowest border border-secondary/10 overflow-hidden">
        {isLoading ? (
          <div className="p-20 text-center text-on-surface-variant/60 flex flex-col items-center justify-center gap-3">
            <span className="material-symbols-outlined text-4xl animate-spin text-secondary">progress_activity</span>
            <p className="text-sm font-semibold uppercase tracking-widest">Đang tải danh sách học liệu...</p>
          </div>
        ) : error ? (
          <div className="p-20 text-center text-error/80 flex flex-col items-center justify-center gap-3">
            <span className="material-symbols-outlined text-4xl">error</span>
            <p className="text-sm font-semibold">{error}</p>
            <button onClick={loadDocuments} className="text-xs underline text-secondary mt-2">Thử lại</button>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="p-20 text-center text-on-surface-variant/60 flex flex-col items-center justify-center gap-2">
            <span className="material-symbols-outlined text-4xl">folder_off</span>
            <p className="text-sm font-semibold uppercase tracking-widest">Không có tài liệu nào trùng khớp</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-high/50 border-b border-secondary/20">
                    <th className="px-6 py-4 font-semibold text-[11px] text-secondary uppercase tracking-[0.2em] text-center">Tên học liệu</th>
                    <th className="px-6 py-4 font-semibold text-[11px] text-secondary uppercase tracking-[0.2em] text-center">Mô tả</th>
                    <th className="px-6 py-4 font-semibold text-[11px] text-secondary uppercase tracking-[0.2em] text-center">Định dạng & Dung lượng</th>
                    <th className="px-6 py-4 font-semibold text-[11px] text-secondary uppercase tracking-[0.2em] text-center">Giáo trình</th>
                    <th className="px-6 py-4 font-semibold text-[11px] text-secondary uppercase tracking-[0.2em] text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary/10">
                  {currentDocs.map((doc) => (
                    <tr key={doc.key} className="hover:bg-secondary/5 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center">
                          {doc.imageUrl ? (
                            <img
                              src={doc.imageUrl}
                              alt="Cover"
                              className="w-10 h-10 object-cover border border-secondary/20 mr-4"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-surface-container flex items-center justify-center border border-secondary/30 mr-4">
                              <span className={`material-symbols-outlined ${getFileTypeInfo(doc.contentType, doc.fileName).color} text-xl`}>
                                {getFileTypeInfo(doc.contentType, doc.fileName).icon}
                              </span>
                            </div>
                          )}
                          <div>
                            <span className="font-display text-[15px] font-semibold text-on-surface block leading-tight">
                              {doc.title}
                            </span>
                            <span className="text-[10px] text-on-surface-variant/60 font-mono block mt-0.5">
                              {doc.fileName}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 border-l border-secondary/5">
                        <p className="text-on-surface-variant text-sm line-clamp-1 max-w-xs" title={doc.description}>
                          {doc.description || <em className="opacity-40">Không có mô tả</em>}
                        </p>
                      </td>
                      <td className="px-6 py-5 text-center border-l border-secondary/5">
                        <span className="text-on-surface text-xs block font-bold uppercase">
                          {getFileTypeInfo(doc.contentType, doc.fileName).label}
                        </span>
                        <span className="text-[10px] text-on-surface-variant/70 block mt-0.5">
                          {formatFileSize(doc.fileSize)}
                        </span>
                      </td>
                      <td className="px-6 py-5 border-l border-secondary/5">
                        <span className="inline-flex items-center px-2.5 py-0.5 border border-secondary/40 text-[10px] text-secondary uppercase tracking-widest font-bold bg-secondary/5">
                          {doc.category || "Chưa phân loại"}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right border-l border-secondary/5">
                        <div className="flex justify-end space-x-4 opacity-70 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditModal(doc)}
                            className="text-on-surface-variant hover:text-secondary transition-colors flex items-center space-x-1"
                            title="Sửa"
                          >
                            <span className="material-symbols-outlined text-lg">edit</span>
                            <span className="text-[11px] uppercase tracking-tighter font-medium">Sửa</span>
                          </button>
                          <button
                            onClick={() => openDeleteModal(doc)}
                            className="text-on-surface-variant hover:text-error transition-colors flex items-center space-x-1"
                            title="Xóa"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                            <span className="text-[11px] uppercase tracking-tighter font-medium">Xóa</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 flex items-center justify-between border-t border-secondary/10 bg-surface-container-low/50">
              <p className="text-xs text-on-surface-variant uppercase tracking-widest font-semibold">
                Hiển thị {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredDocs.length)} trong {filteredDocs.length} tài liệu
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1 border border-secondary/20 text-on-surface-variant hover:border-secondary hover:text-secondary transition-all disabled:opacity-30"
                >
                  <span className="material-symbols-outlined">navigate_before</span>
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 border text-xs font-bold transition-all ${currentPage === i + 1 ? "border-secondary bg-secondary/10 text-secondary" : "border-secondary/20 text-on-surface-variant hover:border-secondary hover:text-secondary"}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1 border border-secondary/20 text-on-surface-variant hover:border-secondary hover:text-secondary transition-all disabled:opacity-30"
                >
                  <span className="material-symbols-outlined">navigate_next</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Additional Detail Section */}
      <div className="mt-16 border-t border-secondary/20 pt-8 flex gap-12 flex-wrap md:flex-nowrap">
        <div className="flex-1">
          <h5 className="font-display text-2xl text-on-surface mb-4">Ghi chú Quản lý</h5>
          <div className="p-6 bg-surface-container border-l-[3px] border-secondary italic text-on-surface-variant text-sm leading-relaxed">
            Mọi tài liệu khi tải lên sẽ tự động được trích xuất văn bản thô đầy đủ (FullText) thông qua công cụ đọc PDF/MD của hệ thống RAG và lưu trữ trong cơ sở dữ liệu học tập. Việc xóa tài liệu học sẽ kéo theo việc tự động hủy bỏ các tiến trình học tập của học viên và các bộ đề trắc nghiệm thông minh sinh ra từ tài liệu đó.
          </div>
        </div>
      </div>

      {/* Greek decorative element */}
      <div className="mt-24 mb-12 text-center">
        <div className="greek-divider w-32 mx-auto relative group">
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-secondary bg-surface px-2 text-lg group-hover:rotate-180 transition-transform duration-700">•</span>
        </div>
      </div>

      {/* MODALS */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface-container border border-secondary/20 w-full max-w-lg p-8 relative shadow-2xl animate-scale-in">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-secondary transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            {modalMode === "upload" && (
              <form onSubmit={handleUploadSubmit} className="space-y-6">
                <div>
                  <h4 className="font-display text-2xl font-semibold text-on-surface mb-2">Tải Lên Học Liệu Mới</h4>
                  <p className="text-xs text-on-surface-variant/70">Tải lên tệp tài liệu mới lên S3 và lập chỉ mục (index) văn bản tự động.</p>
                </div>

                {modalError && (
                  <div className="p-3 bg-error/10 border border-error/20 text-error text-xs font-semibold">
                    {modalError}
                  </div>
                )}

                <div className="space-y-4">
                  {/* File Input */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary mb-1.5">Tệp tài liệu (.pdf, .md, .docx) *</label>
                    <input
                      type="file"
                      accept=".pdf,.md,.docx"
                      onChange={(e) => setUploadFile(e.target.files[0])}
                      required
                      className="w-full text-xs text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:border file:border-secondary/20 file:bg-surface-container-high file:text-secondary file:text-xs file:font-semibold hover:file:bg-secondary/10"
                    />
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary mb-1.5">Tiêu đề (Để trống sẽ lấy tên tệp)</label>
                    <input
                      type="text"
                      placeholder="Nhập tiêu đề học liệu"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full bg-surface-container-high border border-secondary/20 text-on-surface px-3 py-2 text-sm focus:outline-none focus:border-secondary"
                    />
                  </div>

                  {/* Category / Giáo trình */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary mb-1.5">Giáo trình *</label>
                    <div className="relative flex items-center mb-2">
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="w-full bg-surface-container-high border border-secondary/20 text-on-surface px-3 py-2 pr-8 text-sm focus:outline-none focus:border-secondary cursor-pointer appearance-none"
                      >
                        {uploadCurriculaOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                        <option value="other">Giáo trình khác...</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-2 pointer-events-none text-on-surface-variant/60 text-lg">
                        arrow_drop_down
                      </span>
                    </div>

                    {formCategory === "other" && (
                      <input
                        type="text"
                        placeholder="Nhập tên giáo trình mới..."
                        value={customUploadCategory}
                        onChange={(e) => setCustomUploadCategory(e.target.value)}
                        required
                        className="w-full bg-surface-container-high border border-secondary/20 text-on-surface px-3 py-2 text-sm focus:outline-none focus:border-secondary mt-1"
                      />
                    )}
                  </div>

                  {/* Cover Image */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary mb-1.5">Ảnh bìa (Không bắt buộc)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setUploadImage(e.target.files[0])}
                      className="w-full text-xs text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:border file:border-secondary/20 file:bg-surface-container-high file:text-secondary file:text-xs file:font-semibold hover:file:bg-secondary/10"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary mb-1.5">Mô tả ngắn</label>
                    <textarea
                      placeholder="Nhập mô tả tóm tắt nội dung tài liệu học tập..."
                      value={formDesc}
                      onChange={(e) => setFormDesc(e.target.value)}
                      rows="3"
                      className="w-full bg-surface-container-high border border-secondary/20 text-on-surface px-3 py-2 text-sm focus:outline-none focus:border-secondary resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-secondary/10">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-secondary text-on-secondary px-6 py-2 text-xs font-bold uppercase tracking-wider border border-secondary hover:bg-transparent hover:text-secondary disabled:opacity-40 transition-all duration-300"
                  >
                    {saving ? "Đang tải lên..." : "Xác nhận"}
                  </button>
                </div>
              </form>
            )}

            {modalMode === "edit" && (
              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div>
                  <h4 className="font-display text-2xl font-semibold text-on-surface mb-2">Chỉnh Sửa Thông Tin</h4>
                  <p className="text-xs text-on-surface-variant/70">Cập nhật thông tin mô tả và siêu dữ liệu cho tài liệu hiện có.</p>
                </div>

                {modalError && (
                  <div className="p-3 bg-error/10 border border-error/20 text-error text-xs font-semibold">
                    {modalError}
                  </div>
                )}

                <div className="space-y-4">
                  {/* File details read-only */}
                  <div className="p-3 bg-surface-container-high/60 border border-secondary/10 text-xs text-on-surface-variant space-y-1">
                    <p><strong>Tên file gốc:</strong> {selectedDoc?.fileName}</p>
                    <p><strong>Đường dẫn khóa S3:</strong> <span className="font-mono text-[10px] break-all">{selectedDoc?.key}</span></p>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary mb-1.5">Tiêu đề học liệu *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nhập tiêu đề học liệu"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full bg-surface-container-high border border-secondary/20 text-on-surface px-3 py-2 text-sm focus:outline-none focus:border-secondary"
                    />
                  </div>

                  {/* Category / Giáo trình */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary mb-1.5">Giáo trình *</label>
                    <div className="relative flex items-center mb-2">
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="w-full bg-surface-container-high border border-secondary/20 text-on-surface px-3 py-2 pr-8 text-sm focus:outline-none focus:border-secondary cursor-pointer appearance-none"
                      >
                        {uploadCurriculaOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                        <option value="other">Giáo trình khác...</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-2 pointer-events-none text-on-surface-variant/60 text-lg">
                        arrow_drop_down
                      </span>
                    </div>

                    {formCategory === "other" && (
                      <input
                        type="text"
                        placeholder="Nhập tên giáo trình mới..."
                        value={customUploadCategory}
                        onChange={(e) => setCustomUploadCategory(e.target.value)}
                        required
                        className="w-full bg-surface-container-high border border-secondary/20 text-on-surface px-3 py-2 text-sm focus:outline-none focus:border-secondary mt-1"
                      />
                    )}
                  </div>

                  {/* Cover Image */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary mb-1.5">Đổi ảnh bìa mới (Không bắt buộc)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setUploadImage(e.target.files[0])}
                      className="w-full text-xs text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:border file:border-secondary/20 file:bg-surface-container-high file:text-secondary file:text-xs file:font-semibold hover:file:bg-secondary/10"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary mb-1.5">Mô tả ngắn</label>
                    <textarea
                      placeholder="Nhập mô tả tóm tắt nội dung tài liệu..."
                      value={formDesc}
                      onChange={(e) => setFormDesc(e.target.value)}
                      rows="3"
                      className="w-full bg-surface-container-high border border-secondary/20 text-on-surface px-3 py-2 text-sm focus:outline-none focus:border-secondary resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-secondary/10">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-secondary text-on-secondary px-6 py-2 text-xs font-bold uppercase tracking-wider border border-secondary hover:bg-transparent hover:text-secondary disabled:opacity-40 transition-all duration-300"
                  >
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              </form>
            )}

            {modalMode === "delete" && (
              <form onSubmit={handleDeleteSubmit} className="space-y-6">
                <div>
                  <h4 className="font-display text-2xl font-semibold text-error mb-2">Xác Nhận Xóa Tài Liệu</h4>
                  <p className="text-xs text-on-surface-variant/70">Hành động này không thể hoàn tác. Vui lòng kiểm tra kỹ trước khi đồng ý.</p>
                </div>

                {modalError && (
                  <div className="p-3 bg-error/10 border border-error/20 text-error text-xs font-semibold">
                    {modalError}
                  </div>
                )}

                <div className="p-4 bg-error/5 border border-error/20 text-sm text-on-surface space-y-2">
                  <p>Bạn sắp xóa vĩnh viễn tài liệu học:</p>
                  <p className="font-bold text-base text-secondary">{selectedDoc?.title}</p>
                  <p className="text-xs text-on-surface-variant/80">Tên file: <span className="font-mono">{selectedDoc?.fileName}</span></p>
                  <p className="text-xs text-error/90 font-semibold mt-4 block">
                    * CẢNH BÁO: Xóa học liệu này sẽ tự động xóa sạch các tiến trình học tập của toàn bộ học viên và các bộ đề trắc nghiệm trích xuất từ tài liệu này khỏi hệ thống database.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-secondary/10">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-error text-white px-6 py-2 text-xs font-bold uppercase tracking-wider border border-error hover:bg-transparent hover:text-error disabled:opacity-40 transition-all duration-300"
                  >
                    {saving ? "Đang xóa..." : "Đồng ý xóa"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
