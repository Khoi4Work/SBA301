package com.philosophy.rag.repository.custom;

import com.philosophy.rag.dto.DocumentContent;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class VectorStoreRepository {
    private final JdbcTemplate jdbcTemplate;

    public VectorStoreRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<DocumentContent> getDocumentContent() {
        String sql = "SELECT " +
                "metadata->>'source' as source, " +
                "content, " +
                "metadata->>'upload_date' as upload_date, " +
                "metadata->>'contentType' as content_type, " +
                "metadata->>'contentLength' as content_length, " +
                "ROW_NUMBER() OVER (PARTITION BY metadata->>'source' ORDER BY content) as chunk_count, " +
                "CAST(LENGTH(content) AS double precision) as avg_chunk_length " +
                "FROM vector_store";

        return jdbcTemplate.query(sql, (rs, rowNum) -> new DocumentContent(
                rs.getString("source"),
                rs.getString("content"),
                rs.getString("upload_date"),
                rs.getString("content_type"),
                rs.getString("content_length"),
                rs.getLong("chunk_count"),
                rs.getDouble("avg_chunk_length")
        ));
    }

    public void truncateStore() {
        jdbcTemplate.execute("TRUNCATE TABLE vector_store");
    }
}
