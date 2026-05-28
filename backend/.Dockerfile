# Sử dụng base image là ollama chính chủ
FROM ollama/ollama

# Mở cổng 11434
EXPOSE 11434

# Mẹo cực quan trọng: Khởi động server ollama ngầm, đợi 5 giây, rồi pull model ngay trong lúc build
RUN nohup bash -c "ollama serve &" && sleep 5 && ollama pull nomic-embed-text

# Entrypoint mặc định của base image đã là chạy ollama rồi, nên không cần viết lại.