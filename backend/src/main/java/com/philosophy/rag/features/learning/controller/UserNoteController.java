package com.philosophy.rag.features.learning.controller;

import com.philosophy.rag.base.response.ApiResponse;
import com.philosophy.rag.features.auth.service.UserService;
import com.philosophy.rag.features.learning.dto.UserNoteRequest;
import com.philosophy.rag.features.learning.dto.UserNoteResponse;
import com.philosophy.rag.features.learning.service.UserNoteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@Validated
@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
@Tag(name = "User Notes", description = "APIs for managing user highlights and notes on reading documents")
public class UserNoteController {

    private final UserNoteService userNoteService;
    private final UserService userService;

    @Operation(summary = "Get all notes for a specific document")
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserNoteResponse>>> getNotes(
            @RequestParam("s3Key") String s3Key) {
        UUID userId = userService.getCurrentUserId();
        List<UserNoteResponse> notes = userNoteService.getNotesByDocument(userId, s3Key);
        return ResponseEntity.ok(ApiResponse.success(notes));
    }

    @Operation(summary = "Create a new note/highlight")
    @PostMapping
    public ResponseEntity<ApiResponse<UserNoteResponse>> createNote(
            @Valid @RequestBody UserNoteRequest request) {
        UUID userId = userService.getCurrentUserId();
        UserNoteResponse response = userNoteService.createNote(userId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Đã lưu ghi chú thành công"));
    }

    @Operation(summary = "Update an existing note")
    @PutMapping("/{noteId}")
    public ResponseEntity<ApiResponse<UserNoteResponse>> updateNote(
            @PathVariable("noteId") UUID noteId,
            @Valid @RequestBody UserNoteRequest request) {
        UUID userId = userService.getCurrentUserId();
        UserNoteResponse response = userNoteService.updateNote(userId, noteId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Cập nhật ghi chú thành công"));
    }

    @Operation(summary = "Delete a note")
    @DeleteMapping("/{noteId}")
    public ResponseEntity<ApiResponse<String>> deleteNote(
            @PathVariable("noteId") UUID noteId) {
        UUID userId = userService.getCurrentUserId();
        userNoteService.deleteNote(userId, noteId);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa ghi chú thành công"));
    }
}
