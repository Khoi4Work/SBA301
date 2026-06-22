package com.philosophy.rag.service.impl;

import com.philosophy.rag.base.persistence.Prompt;
import com.philosophy.rag.dto.request.DebateGameRequest;
import com.philosophy.rag.dto.response.DebateGameResponse;
import com.philosophy.rag.dto.request.EscapeGameRequest;
import com.philosophy.rag.dto.response.EscapeGameResponse;
import com.philosophy.rag.entity.User;
import com.philosophy.rag.repository.UserRepository;
import com.philosophy.rag.service.GameService;
import com.philosophy.rag.service.RagService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class GameServiceImpl implements GameService {

    private final UserRepository userRepository;
    private final RagService ragService;

    @Override
    @Transactional
    public EscapeGameResponse analyzeEscapeGame(EscapeGameRequest request) {
        // 1. Authenticate user if logged in to award XP
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = null;
        if (authentication != null && authentication.isAuthenticated()
                && !(authentication instanceof AnonymousAuthenticationToken)) {
            String username = authentication.getName();
            user = userRepository.findByUsername(username).orElse(null);
        }

        // 2. Calculate fake % (Prestige vs Wisdom ratio)
        int prestige = Math.max(0, request.getPrestige());
        int wisdom = Math.max(0, request.getWisdom());
        int total = prestige + wisdom;
        int phongBatPercentage = total > 0 ? (prestige * 100) / total : 0;

        // 3. Determine title
        String title;
        if (phongBatPercentage >= 80) {
            title = "KOL Ảo Vọng Phông Bạt (Bậc Thầy Làm Màu)";
        } else if (phongBatPercentage >= 50) {
            title = "Kẻ Tha Hóa Của Xã Hội Tiêu Dùng (Nạn Nhân Trào Lưu)";
        } else if (phongBatPercentage >= 20) {
            title = "Học Giả Thực Tế Kiên Định (Người Làm Chủ Thực Tại)";
        } else {
            title = "Triết Gia Khắc Kỷ Biện Chứng (Nhà Tư Tưởng Độc Lập)";
        }

        int happiness = request.getHappiness() != null ? request.getHappiness() : 50;
        int health = request.getHealth() != null ? request.getHealth() : 100;
        int social = request.getSocial() != null ? request.getSocial() : 50;

        // 4. Create prompt for AI to analyze the choices under Marxist Philosophy
        String choicesText = request.getChoices() != null ? String.join("\n", request.getChoices()) : "Không có lựa chọn nào ghi nhận.";
        String prompt = Prompt.ANALYZE_ESCAPE_GAME_PROMPT
                .replace("{phongBatPercentage}", String.valueOf(phongBatPercentage))
                .replace("{wisdom}", String.valueOf(wisdom))
                .replace("{prestige}", String.valueOf(prestige))
                .replace("{budget}", String.valueOf(total))
                .replace("{happiness}", String.valueOf(happiness / 100))
                .replace("{health}", String.valueOf(health / 100))
                .replace("{social}", String.valueOf(social / 100))
                .replace("{choicesText}", choicesText);

        log.info("Sending prompt to AI for Escape game analysis");
        String rawAnalysis = ragService.prompt(prompt);

        // Parse rehabilitation suggestion
        String analysis = rawAnalysis;
        String rehabilitation = "Đọc tác phẩm 'Tư bản' của Karl Marx để hiểu rõ hơn về bản chất của hàng hóa và tiền tệ.";

        int rehabIndex = rawAnalysis.indexOf("[REHABILITATION]:");
        if (rehabIndex != -1) {
            analysis = rawAnalysis.substring(0, rehabIndex).trim();
            rehabilitation = rawAnalysis.substring(rehabIndex + "[REHABILITATION]:".length()).trim();
        }

        // 5. Award XP based on Wisdom (1 XP for every 10 Wisdom points, min 10 XP, max 50 XP)
        int xpGained = Math.max(10, Math.min(50, wisdom / 10));
        int newTotalXp = 0;

        if (user != null) {
            newTotalXp = user.getTotalXp() + xpGained;
            user.setTotalXp(newTotalXp);
            user.setStreak(user.getStreak() + 1);
            userRepository.save(user);
            log.info("Awarded {} XP to user {}. New total XP: {}", xpGained, user.getUsername(), newTotalXp);
        }

        return EscapeGameResponse.builder()
                .phongBatPercentage(phongBatPercentage)
                .title(title)
                .analysis(analysis)
                .rehabilitationSuggestion(rehabilitation)
                .xpGained(xpGained)
                .newTotalXp(newTotalXp)
                .build();
    }

    @Override
    @Transactional
    public DebateGameResponse analyzeDebateGame(DebateGameRequest request) {
        // 1. Authenticate user if logged in to award XP
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = null;
        if (authentication != null && authentication.isAuthenticated()
                && !(authentication instanceof AnonymousAuthenticationToken)) {
            String username = authentication.getName();
            user = userRepository.findByUsername(username).orElse(null);
        }

        // 2. Calculate win margin percentage
        int playerHp = Math.max(0, request.getPlayerHp());
        int opponentHp = Math.max(0, request.getOpponentHp());
        boolean isVictory = playerHp > opponentHp;

        int winMarginPercentage;
        if (isVictory) {
            winMarginPercentage = (playerHp * 100) / (playerHp + opponentHp + 1);
        } else {
            winMarginPercentage = -((opponentHp * 100) / (playerHp + opponentHp + 1));
        }

        // 3. Determine title
        String resultTitle = isVictory
                ? "Học Giả Kiến Thiết Lý Luận (Bậc Thầy Biện Chứng)"
                : "Kẻ Bại Trận Trước Ảo Vọng Vật Chất (Thất bại lập luận)";

        // 4. Create prompt for AI Karl Marx to critique the debate
        String argumentsText = request.getArguments() != null ? String.join("\n", request.getArguments()) : "Không ghi nhận phản biện nào.";
        String prompt = Prompt.ANALYZE_DEBATE_GAME_PROMPT
                .replace("{isVictory}", (isVictory ? "CHIẾN THẮNG" : "THẤT BẠI"))
                .replace("{playerHp}", String.valueOf(playerHp/100))
                .replace("{opponentHp}", String.valueOf(opponentHp/100))
                .replace("{winMarginPercentage}", String.valueOf(winMarginPercentage))
                .replace("{resultTitle}", resultTitle)
                .replace("{argumentsText}", argumentsText);

        log.info("Sending prompt to AI for Debate game analysis");
        String rawAnalysis = ragService.prompt(prompt);

        // Parse rehabilitation suggestion
        String analysis = rawAnalysis;
        String suggestion = "Đọc 'Bản thảo kinh tế - triết học năm 1844' của Karl Marx.";

        int rehabIndex = rawAnalysis.indexOf("[REHABILITATION]:");
        if (rehabIndex != -1) {
            analysis = rawAnalysis.substring(0, rehabIndex).trim();
            suggestion = rawAnalysis.substring(rehabIndex + "[REHABILITATION]:".length()).trim();
        }

        // 5. Award XP based on Victory (30 XP for Win, 10 XP for Loss)
        int xpGained = isVictory ? 30 : 10;
        int newTotalXp = 0;

        if (user != null) {
            newTotalXp = user.getTotalXp() + xpGained;
            user.setTotalXp(newTotalXp);
            user.setStreak(user.getStreak() + 1);
            userRepository.save(user);
            log.info("Awarded {} XP to user {}. New total XP: {}", xpGained, user.getUsername(), newTotalXp);
        }

        return DebateGameResponse.builder()
                .winMarginPercentage(winMarginPercentage)
                .resultTitle(resultTitle)
                .analysis(analysis)
                .suggestion(suggestion)
                .xpGained(xpGained)
                .newTotalXp(newTotalXp)
                .build();
    }
}
