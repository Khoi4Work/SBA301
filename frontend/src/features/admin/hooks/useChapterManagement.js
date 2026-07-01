import { useState, useEffect } from "react";
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

  // ── Modal state ─────────────────────────────────────────────
  const [modalMode, setModalMode] = useState(null); // "upload" | "edit" | "delete"
  const [selectedDoc, setSelectedDoc] = useState(null);

  // ── Form state ──────────────────────────────────────────────
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formCategory, setFormCategory] = useState("Tài liệu ôn tập");
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadImage, setUploadImage] = useState(null);

  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState("");

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
    setFormCategory("Tài liệu ôn tập");
    setUploadFile(null);
    setUploadImage(null);
    setModalError("");
  };

  const openEditModal = (doc) => {
    setModalMode("edit");
    setSelectedDoc(doc);
    setFormTitle(doc.title || "");
    setFormDesc(doc.description || "");
    setFormCategory(doc.category || "Tài liệu ôn tập");
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
      setModalError("Vui lòng chọn tệp tin tài liệu (.pdf hoặc .md)");
      return;
    }

    const formData = new FormData();
    formData.append("file", uploadFile);
    if (formTitle.trim()) formData.append("title", formTitle);
    if (formDesc.trim()) formData.append("description", formDesc);
    if (uploadImage) formData.append("image", uploadImage);
    formData.append("category", formCategory);

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
    const formData = new FormData();
    if (formTitle.trim()) formData.append("title", formTitle);
    if (formDesc.trim()) formData.append("description", formDesc);
    if (uploadImage) formData.append("image", uploadImage);
    formData.append("category", formCategory);

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
  const filteredDocs = documents.filter((doc) => {
    const q = searchQuery.toLowerCase();
    const titleMatch = doc.title?.toLowerCase().includes(q);
    const fileMatch = doc.fileName?.toLowerCase().includes(q);
    const categoryMatch = doc.category?.toLowerCase().includes(q);
    return titleMatch || fileMatch || categoryMatch;
  });

  const totalPages = Math.ceil(filteredDocs.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDocs = filteredDocs.slice(indexOfFirstItem, indexOfLastItem);

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
