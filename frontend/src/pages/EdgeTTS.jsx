import React, { useState } from 'react';
import {apiVoice} from "../services/apiVoice.js";

const EdgeTTS = () => {
  const [text, setText] = useState('Chất lượng giọng đọc này quá tuyệt vời cho một dự án MVP.');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    text: '',
    voice: 'vi-VN-HoaiMyNeural',
  });


  const handleChange = (e) => {
    const {name, value} = e.target;
    setFormData(prevState => ({...prevState, [name]: value}));
  };
  const handleSpeak = async () => {
    setIsLoading(true);
    try {
      const response = await apiVoice.speak(formData);

      // Nhận response dưới dạng JSON
      const data = await response.data;

      // Check code theo chuẩn ApiResponse của bạn (code 1000 là success)
      if (data.code === 1000) {
        // data.result chính là chuỗi Base64 của file mp3
        const base64Audio = data.result;

        // Tạo Audio source từ chuỗi Base64
        const audioSrc = `data:audio/mpeg;base64,${base64Audio}`;
        const audio = new Audio(audioSrc);
        await audio.play();
      } else {
        // Xử lý lỗi trả về từ API
        alert(`Lỗi: ${data.message}`);
      }

    } catch (error) {
      console.error(error);
      alert('Không thể kết nối đến server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3>Trải nghiệm Microsoft Edge TTS (Dùng ApiResponse)</h3>
      <textarea
        rows="4"
        style={{ width: '100%', marginBottom: '10px' }}
        name="text"
        value={formData.text}
        onChange={handleChange}
      />
      <button onClick={handleSpeak} disabled={isLoading}>
        {isLoading ? 'Đang tạo âm thanh...' : 'Đọc ngay'}
      </button>
    </div>
  );
};

export default EdgeTTS;