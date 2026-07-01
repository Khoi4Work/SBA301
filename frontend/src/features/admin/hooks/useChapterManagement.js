import { useState, useEffect, useMemo } from "react";
import {
  fetchDocuments,
  uploadDocument,
  updateDocument,
  deleteDocument,
  formatFileSize,
  formatDate,
} from "@/services/documentService.js";
import { extractResponse } from "@/features/admin/utils/extractResponse.js";

/**
 * Hook encapsulating all state and logic for the Chapter (Document) Management page.
 */
export function useChapterManagement() {
  // ── Data state ──────────────────────────────────────────────
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // ── Search & pagination ─────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // ── Filter states ───────────────────────────────────────────
  const [selectedCurriculum, setSelectedCurriculum] = useState("Tất cả giáo trình");
  const [selectedChapter, setSelectedChapter] = useState("Tất cả chương");
  const [selectedSection, setSelectedSection] = useState("Tất cả mục La Mã");
  const [selectedNumberSection, setSelectedNumberSection] = useState("Tất cả phần số");
  const [selectedLetterSection, setSelectedLetterSection] = useState("Tất cả phần chữ");
  const [selectedFormat, setSelectedFormat] = useState("Tất cả định dạng");

  // ── Modal state ─────────────────────────────────────────────
  const [modalMode, setModalMode] = useState(null); // "upload" | "edit" | "delete"
  const [selectedDoc, setSelectedDoc] = useState(null);

  // ── Form state ──────────────────────────────────────────────
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [customUploadCategory, setCustomUploadCategory] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadImage, setUploadImage] = useState(null);

  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState("");

  // ── Derived / parsing values from file name ───────────────────
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

  // ── Data fetching ───────────────────────────────────────────
  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      setError("");
      const data = await fetchDocuments();
      setDocuments(extractResponse(data));
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

  // ── Modal openers / closer ──────────────────────────────────
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

  // ── Form handlers ───────────────────────────────────────────
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

  // ── Derived / computed values ───────────────────────────────
  const filteredDocs = useMemo(() => {
    return parsedDocs.filter((doc) => {
      // 1. Search Query Match
      const q = searchQuery.toLowerCase();
      const titleMatch = doc.title?.toLowerCase().includes(q);
      const fileMatch = doc.fileName?.toLowerCase().includes(q);
      const categoryMatch = doc.category?.toLowerCase().includes(q);
      const matchesSearch = titleMatch || fileMatch || categoryMatch;

      // 2. Curriculum Match
      const matchesCurriculum = selectedCurriculum === "Tất cả giáo trình" || doc.category === selectedCurriculum;

      // 3. Chapter Match
      const matchesChapter = selectedChapter === "Tất cả chương" || doc.parsedChapter === selectedChapter;

      // 4. Section Match
      const matchesSection = selectedSection === "Tất cả mục La Mã" || doc.parsedSection === selectedSection;

      // 5. Number Section Match
      const matchesNumberSection = selectedNumberSection === "Tất cả phần số" || doc.parsedNumberSection === selectedNumberSection;

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

      return matchesSearch && matchesCurriculum && matchesChapter && matchesSection && matchesNumberSection && matchesLetterSection && matchesFormat;
    });
  }, [parsedDocs, searchQuery, selectedCurriculum, selectedChapter, selectedSection, selectedNumberSection, selectedLetterSection, selectedFormat]);

  const totalPages = useMemo(() => Math.ceil(filteredDocs.length / itemsPerPage) || 1, [filteredDocs]);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDocs = useMemo(() => filteredDocs.slice(indexOfFirstItem, indexOfLastItem), [filteredDocs, indexOfFirstItem, indexOfLastItem]);

  // ── Public API ──────────────────────────────────────────────
  return {
    // data
    documents,
    isLoading,
    error,

    // search & pagination
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    filteredDocs,
    totalPages,
    indexOfFirstItem,
    indexOfLastItem,
    currentDocs,

    // filter states
    selectedCurriculum,
    setSelectedCurriculum,
    selectedChapter,
    setSelectedChapter,
    selectedSection,
    setSelectedSection,
    selectedNumberSection,
    setSelectedNumberSection,
    selectedLetterSection,
    setSelectedLetterSection,
    selectedFormat,
    setSelectedFormat,

    // memoized lists for filters
    curricula,
    uploadCurriculaOptions,
    availableChapters,
    availableSections,
    availableNumberSections,
    availableLetterSections,

    // modal
    modalMode,
    selectedDoc,
    openUploadModal,
    openEditModal,
    openDeleteModal,
    closeModal,

    // form
    formTitle,
    setFormTitle,
    formDesc,
    setFormDesc,
    formCategory,
    setFormCategory,
    customUploadCategory,
    setCustomUploadCategory,
    uploadFile,
    setUploadFile,
    uploadImage,
    setUploadImage,
    saving,
    modalError,

    // actions
    loadDocuments,
    handleUploadSubmit,
    handleEditSubmit,
    handleDeleteSubmit,

    // re-exported helpers so the page doesn't need to import them separately
    formatFileSize,
    formatDate,
  };
}
