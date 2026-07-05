package com.philosophy.rag.features.ai.common;

import java.util.Map;


public final class DocumentMetadataUtils {

    private DocumentMetadataUtils() {}

    public static String getMetadataValue(Map<String, Object> metadata, String key, String defaultValue) {
        if (metadata == null || !metadata.containsKey(key) || metadata.get(key) == null) {
            return defaultValue;
        }

        return String.valueOf(metadata.get(key));
    }
}
