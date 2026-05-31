import React, { useState, useRef } from 'react';
import { apiVoice } from "../../services/apiVoice.js";
import Karl_Marx from "../../Avatar3D/Karl_Marx.jsx";

const VoiceTest = () => {
  // Đã gộp text mặc định vào thẳng formData cho đồng bộ
  const [formData, setFormData] = useState({
    text: 'Chất lượng giọng đọc này quá tuyệt vời cho một dự án MVP.',
    voice: 'vi-VN-HoaiMyNeural',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false); // Trạng thái của Mic

  const recognitionRef = useRef(null); // Lưu trữ instance của SpeechRecognition

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  // ==========================================
  // 1. LOGIC NHẬN DIỆN GIỌNG NÓI (SPEECH TO TEXT)
  // ==========================================
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Trình duyệt của bạn không hỗ trợ API này. Vui lòng sử dụng Google Chrome hoặc Microsoft Edge.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = 'vi-VN'; // Bắt buộc tiếng Việt
    recognitionRef.current.continuous = true; // Cho phép nói dài
    recognitionRef.current.interimResults = true; // Lấy kết quả ngay khi đang nói

    recognitionRef.current.onresult = (event) => {
      let currentTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      // Cập nhật chữ vào textarea theo thời gian thực
      setFormData(prev => ({ ...prev, text: currentTranscript }));
    };

    recognitionRef.current.onerror = (event) => {
      console.error("Lỗi Mic:", event.error);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    // Xóa text cũ đi để chuẩn bị nghe text mới
    setFormData(prev => ({ ...prev, text: '' }));

    recognitionRef.current.start();
    setIsListening(true);
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // ==========================================
  // 2. LOGIC TẠO GIỌNG ĐỌC (TEXT TO SPEECH)
  // ==========================================
  const handleSpeak = async () => {
    if (!formData.text.trim()) {
      alert("Vui lòng nhập văn bản hoặc dùng Mic để nói.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiVoice.speak(formData);

      // axios tự động parse JSON rồi, nên bạn dùng response.data thay vì await response.data
      const data = response.data;

      if (data.code === 1000) {
        const base64Audio = data.result;
        const audioSrc = `data:audio/mpeg;base64,${base64Audio}`;
        const audio = new Audio(audioSrc);
        await audio.play();
      } else {
        alert(`Lỗi: ${data.message}`);
      }
    } catch (error) {
      console.error("Lỗi gọi API TTS:", error);
      alert('Không thể kết nối đến server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div style={{ padding: '20px', maxWidth: '600px' }}>
        <h3>Trải nghiệm STT & TTS (Web API + Edge)</h3>
        <Karl_Marx/>
        {/* Khung nút điều khiển Mic */}
        <div style={{ marginBottom: '10px' }}>
          <button
              onClick={isListening ? stopListening : startListening}
              style={{
                padding: '10px 20px',
                backgroundColor: isListening ? '#dc3545' : '#198754',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
          >
            {isListening ? '🛑 Dừng ghi âm' : '🎤 Nhấn để nói'}
          </button>
          {isListening && <span style={{ marginLeft: '10px', color: 'red' }}>Đang nghe...</span>}
        </div>

        {/* Khung nhập liệu (tự động điền khi nói) */}
        <textarea
            rows="5"
            style={{ width: '100%', marginBottom: '10px', padding: '10px', fontSize: '16px' }}
            name="text"
            placeholder="Bấm Mic để nói hoặc tự gõ vào đây..."
            value={formData.text}
            onChange={handleChange}
        />

        {/* Nút gọi Backend đọc */}
        <button
            onClick={handleSpeak}
            disabled={isLoading || isListening}
            style={{
              padding: '10px 20px',
              backgroundColor: '#0d6efd',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: (isLoading || isListening) ? 'not-allowed' : 'pointer',
              opacity: (isLoading || isListening) ? 0.7 : 1
            }}
        >
          {isLoading ? '⏳ Đang tạo âm thanh...' : '🔊 Đọc văn bản này'}
        </button>
      </div>
  );
};

export default VoiceTest;