package com.philosophy.rag.features.ai.repository;

import com.philosophy.rag.utils.dto.DocumentContent;
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

    /**
     * Returns a page of distinct documents (grouped by source / filename).
     * Each row represents one uploaded document with aggregated metadata.
     *
     * @param offset zero-based row offset
     * @param size   maximum number of rows to return
     */
    public List<DocumentContent> getDocumentContentPaged(int offset, int size) {
        String sql =
                "SELECT " +
                "  metadata->>'source'               AS source, " +
                "  MIN(content)                      AS content, " +
                "  MIN(metadata->>'upload_date')     AS upload_date, " +
                "  MIN(metadata->>'contentType')     AS content_type, " +
                "  MIN(metadata->>'contentLength')   AS content_length, " +
                "  COUNT(*)                          AS chunk_count, " +
                "  AVG(CAST(LENGTH(content) AS double precision)) AS avg_chunk_length " +
                "FROM vector_store " +
                "GROUP BY metadata->>'source' " +
                "ORDER BY upload_date DESC NULLS LAST, source ASC " +
                "LIMIT ? OFFSET ?";

        return jdbcTemplate.query(sql,
                (rs, rowNum) -> new DocumentContent(
                        rs.getString("source"),
                        rs.getString("content"),
                        rs.getString("upload_date"),
                        rs.getString("content_type"),
                        rs.getString("content_length"),
                        rs.getLong("chunk_count"),
                        rs.getDouble("avg_chunk_length")
                ),
                size, offset);
    }

    /**
     * Returns the total number of distinct documents (unique sources)
     * currently stored in the vector store.
     */
    public long countDistinctDocuments() {
        String sql = "SELECT COUNT(DISTINCT metadata->>'source') FROM vector_store";
        Long count = jdbcTemplate.queryForObject(sql, Long.class);
        return count != null ? count : 0L;
    }

    /**
     * Deletes all document chunks from the vector store matching the given source filename.
     */
    public void deleteBySource(String source) {
        String sql = "DELETE FROM vector_store WHERE metadata->>'source' = ?";
        jdbcTemplate.update(sql, source);
    }

    /**
     * Returns a page of individual chunks for a specific document.
     */
    public List<com.philosophy.rag.features.ai.dto.DocumentChunk> getChunksBySourcePaged(String source, int offset, int size) {
        String sql =
                "SELECT " +
                "  id, " +
                "  metadata->>'source' AS source, " +
                "  content, " +
                "  CAST(metadata->>'chunk_index' AS INTEGER) AS chunk_index, " +
                "  metadata->>'indexed_at' AS indexed_at " +
                "FROM vector_store " +
                "WHERE metadata->>'source' = ? " +
                "ORDER BY CAST(metadata->>'chunk_index' AS INTEGER) ASC NULLS LAST " +
                "LIMIT ? OFFSET ?";

        return jdbcTemplate.query(sql,
                (rs, rowNum) -> com.philosophy.rag.features.ai.dto.DocumentChunk.builder()
                        .id(rs.getString("id"))
                        .source(rs.getString("source"))
                        .content(rs.getString("content"))
                        .chunkIndex(rs.getObject("chunk_index") != null ? rs.getInt("chunk_index") : null)
                        .indexedAt(rs.getString("indexed_at"))
                        .build(),
                source, size, offset);
    }

    /**
     * Returns the total number of chunks for a specific document.
     */
    public long countChunksBySource(String source) {
        String sql = "SELECT COUNT(*) FROM vector_store WHERE metadata->>'source' = ?";
        Long count = jdbcTemplate.queryForObject(sql, Long.class, source);
        return count != null ? count : 0L;
    }
}
