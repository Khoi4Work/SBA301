package com.philosophy.rag.features.ai.service.impl;

import com.philosophy.rag.features.ai.dto.PhilosopherRequest;
import com.philosophy.rag.features.ai.dto.PhilosopherResponse;
import com.philosophy.rag.features.ai.entity.Philosopher;
import com.philosophy.rag.features.ai.repository.PhilosopherRepository;
import com.philosophy.rag.utils.service.MediaStorageService;
import com.philosophy.rag.features.ai.service.PhilosopherService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.philosophy.rag.base.exception.ApiException;
import com.philosophy.rag.base.exception.ErrorCode;
import com.philosophy.rag.features.ai.dto.PageResponse;

@Service
@RequiredArgsConstructor
public class PhilosopherServiceImpl implements PhilosopherService {

    private final PhilosopherRepository philosopherRepository;
    private final MediaStorageService cloudinaryService;

    @Override
    public PageResponse<PhilosopherResponse> findAllPhilosophers(Pageable pageable) {
        Page<Philosopher> page = philosopherRepository.findAll(pageable);

        if (pageable.getPageNumber() >= page.getTotalPages() && page.getTotalPages() > 0) {
            throw new ApiException(ErrorCode.INVALID_PAGE);
        }

        List<PhilosopherResponse> content = page.getContent()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return new PageResponse<>(
                content,
                page.getNumber(),
                page.getTotalPages(),
                page.getTotalElements()
        );
    }

    @Override
    public PhilosopherResponse findPhilosopherById(UUID id) {
        Philosopher philosopher = philosopherRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND));
        return mapToResponse(philosopher);
    }

    @Override
    @Transactional
    public PhilosopherResponse createPhilosopher(PhilosopherRequest request, MultipartFile file, MultipartFile idleFile, MultipartFile talkingFile, MultipartFile thinkingFile) {
        if (philosopherRepository.existsByName(request.name())) {
            throw new ApiException(ErrorCode.DUPLICATE_RESOURCE, "Tên triết gia này đã tồn tại.");
        }

        String avatarUrl = null;
        if (file != null && !file.isEmpty()) {
            avatarUrl = cloudinaryService.uploadImage(file, "philosophy/avatars").getSecureUrl();
            if (philosopherRepository.existsByAvatarUrl(avatarUrl)) {
                throw new ApiException(ErrorCode.DUPLICATE_RESOURCE, "Ảnh đại diện này đã được sử dụng.");
            }
        }

        String idleUrl = null;
        if (idleFile != null && !idleFile.isEmpty()) {
            idleUrl = cloudinaryService.uploadModel(idleFile, "philosophy/models").getSecureUrl();
            if (philosopherRepository.existsByIdleModelUrl(idleUrl)) {
                throw new ApiException(ErrorCode.DUPLICATE_RESOURCE, "Model idle này đã được sử dụng.");
            }
        }

        String talkingUrl = null;
        if (talkingFile != null && !talkingFile.isEmpty()) {
            talkingUrl = cloudinaryService.uploadModel(talkingFile, "philosophy/models").getSecureUrl();
            if (philosopherRepository.existsByTalkingModelUrl(talkingUrl)) {
                throw new ApiException(ErrorCode.DUPLICATE_RESOURCE, "Model talking này đã được sử dụng.");
            }
        }

        String thinkingUrl = null;
        if (thinkingFile != null && !thinkingFile.isEmpty()) {
            thinkingUrl = cloudinaryService.uploadModel(thinkingFile, "philosophy/models").getSecureUrl();
            if (philosopherRepository.existsByThinkingModelUrl(thinkingUrl)) {
                throw new ApiException(ErrorCode.DUPLICATE_RESOURCE, "Model thinking này đã được sử dụng.");
            }
        }

        Philosopher philosopher = Philosopher.builder()
                .name(request.name())
                .avatarUrl(avatarUrl)
                .idleModelUrl(idleUrl)
                .talkingModelUrl(talkingUrl)
                .thinkingModelUrl(thinkingUrl)
                .shortQuote(request.shortQuote())
                .category(request.category())
                .core(request.core())
                .biography(request.biography())
                .systemPrompt(request.systemPrompt())
                .build();

        Philosopher saved = philosopherRepository.save(philosopher);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public void deleteAllPhilosophers() {
        philosopherRepository.deleteAll();
    }

    @Override
    @Transactional
    public PhilosopherResponse updatePhilosopher(UUID id, PhilosopherRequest request, MultipartFile file, MultipartFile idleFile, MultipartFile talkingFile, MultipartFile thinkingFile) {
        Philosopher philosopher = philosopherRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND));

        // Check name uniqueness
        philosopherRepository.findByName(request.name()).ifPresent(p -> {
            if (!p.getPhilosopherId().equals(id)) {
                throw new ApiException(ErrorCode.DUPLICATE_RESOURCE, "Tên triết gia này đã tồn tại.");
            }
        });

        String avatarUrl = philosopher.getAvatarUrl();
        if (file != null && !file.isEmpty()) {
            avatarUrl = cloudinaryService.uploadImage(file, "philosophy/avatars").getSecureUrl();
            philosopherRepository.findByAvatarUrl(avatarUrl).ifPresent(p -> {
                if (!p.getPhilosopherId().equals(id)) {
                    throw new ApiException(ErrorCode.DUPLICATE_RESOURCE, "Ảnh đại diện này đã được sử dụng.");
                }
            });
        }

        if (idleFile != null && !idleFile.isEmpty()) {
            String idleUrl = cloudinaryService.uploadModel(idleFile, "philosophy/models").getSecureUrl();
            philosopherRepository.findByIdleModelUrl(idleUrl).ifPresent(p -> {
                if (!p.getPhilosopherId().equals(id)) {
                    throw new ApiException(ErrorCode.DUPLICATE_RESOURCE, "Model idle này đã được sử dụng.");
                }
            });
            philosopher.setIdleModelUrl(idleUrl);
        }
        if (talkingFile != null && !talkingFile.isEmpty()) {
            String talkingUrl = cloudinaryService.uploadModel(talkingFile, "philosophy/models").getSecureUrl();
            philosopherRepository.findByTalkingModelUrl(talkingUrl).ifPresent(p -> {
                if (!p.getPhilosopherId().equals(id)) {
                    throw new ApiException(ErrorCode.DUPLICATE_RESOURCE, "Model talking này đã được sử dụng.");
                }
            });
            philosopher.setTalkingModelUrl(talkingUrl);
        }
        if (thinkingFile != null && !thinkingFile.isEmpty()) {
            String thinkingUrl = cloudinaryService.uploadModel(thinkingFile, "philosophy/models").getSecureUrl();
            philosopherRepository.findByThinkingModelUrl(thinkingUrl).ifPresent(p -> {
                if (!p.getPhilosopherId().equals(id)) {
                    throw new ApiException(ErrorCode.DUPLICATE_RESOURCE, "Model thinking này đã được sử dụng.");
                }
            });
            philosopher.setThinkingModelUrl(thinkingUrl);
        }

        philosopher.setName(request.name());
        philosopher.setAvatarUrl(avatarUrl);
        philosopher.setShortQuote(request.shortQuote());
        philosopher.setCategory(request.category());
        philosopher.setCore(request.core());
        philosopher.setBiography(request.biography());
        philosopher.setSystemPrompt(request.systemPrompt());

        Philosopher saved = philosopherRepository.save(philosopher);
        return mapToResponse(saved);
    }

    private PhilosopherResponse mapToResponse(Philosopher entity) {
        return PhilosopherResponse.builder()
                .id(entity.getPhilosopherId())
                .name(entity.getName())
                .category(entity.getCategory())
                .quote(entity.getShortQuote())
                .core(entity.getCore())
                .imageUrl(entity.getAvatarUrl())
                .idleModelUrl(entity.getIdleModelUrl())
                .talkingModelUrl(entity.getTalkingModelUrl())
                .thinkingModelUrl(entity.getThinkingModelUrl())
                .biography(entity.getBiography())
                .systemPrompt(entity.getSystemPrompt())
                .build();
    }

    @Override
    @Transactional
    public void deletePhilosopherById(UUID id) {
        Philosopher philosopher = philosopherRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND));

        philosopherRepository.delete(philosopher);
    }
}
