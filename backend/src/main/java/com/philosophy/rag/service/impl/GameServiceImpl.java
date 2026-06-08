package com.philosophy.rag.service.impl;

import com.philosophy.rag.dto.request.DebateGameRequest;
import com.philosophy.rag.dto.response.DebateGameResponse;
import com.philosophy.rag.dto.request.EscapeGameRequest;
import com.philosophy.rag.dto.response.EscapeGameResponse;
import com.philosophy.rag.entity.User;
import com.philosophy.rag.repository.itf.UserRepository;
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

        // 2. Calculate % phông bạt (Prestige vs Wisdom ratio)
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
        String prompt = "Dưới lăng kính Triết học Mác-Lênin, cụ thể là quy luật 'Tồn tại xã hội quyết định ý thức xã hội' và 'Sự biến đổi hệ giá trị trong xã hội tiêu dùng hiện đại', hãy viết một đoạn phân tích đánh giá hành vi và nhận thức của người chơi sau đây.\n" +
                "\n" +
                "Thông số người chơi:\n" +
                "- Tỉ lệ Phông bạt: " + phongBatPercentage + "%\n" +
                "- Danh hiệu: " + title + "\n" +
                "- Trí tuệ thực chất (Wisdom): " + wisdom + "\n" +
                "- Độ phông bạt (Prestige): " + prestige + "\n" +
                "- Ngân sách còn lại (Budget): " + request.getBudget() + " VNĐ\n" +
                "- Độ vui vẻ (Happiness): " + happiness + "/100\n" +
                "- Sức khỏe (Health): " + health + "/100\n" +
                "- Mối quan hệ xã hội thực tế (Social Connections): " + social + "/100\n" +
                "\n" +
                "Các lựa chọn cụ thể của người chơi qua các tình huống:\n" +
                choicesText + "\n" +
                "\n" +
                "YÊU CẦU PHẢN HỒI:\n" +
                "1. Hãy đóng vai một triết gia biện chứng (như Karl Marx nhưng pha chút giọng văn châm biếm, dí dỏm nhưng sâu cay, cực kỳ thấm thía).\n" +
                "2. Giải thích tại sao người chơi lại có các chỉ số phông bạt, vui vẻ, sức khỏe và mối quan hệ như vậy. Nếu phông bạt quá cao làm cạn kiệt ví tiền và làm suy giảm các mối quan hệ thực tế (do thói sống ảo và làm màu phông bạt), hãy vạch trần bản chất hàng hóa hóa lòng tin và sự tha hóa. Nếu lý tính quá cao nhưng họ phải sống quá khắc khổ, thiếu thốn niềm vui hay bị cô lập xã hội, hãy nhận xét xem sự 'khắc kỷ học thuật' đó có cần điều chỉnh để con người phát triển hài hòa toàn diện hay không. Nếu họ đạt được sự cân bằng xuất sắc giữa lý tính, ví tiền, niềm vui và sức khỏe, hãy nhiệt liệt khen ngợi khả năng làm chủ bản thân trước sức ép tồn tại xã hội.\n" +
                "3. Viết bằng tiếng Việt, phân tích sâu sắc, độ dài khoảng 250-350 từ.\n" +
                "4. KHÔNG bao gồm bất kỳ định dạng tiêu đề markdown lớn (như # hoặc ##), hãy viết các đoạn văn trôi chảy.\n" +
                "5. Ở dòng cuối cùng, hãy ghi rõ: '[REHABILITATION]: ' tiếp theo là đề xuất một cuốn sách triết học hoặc một chuyên đề trong ứng dụng này để họ tiếp tục học tập, rèn luyện tư duy thực chất.";

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
        String prompt = "Dưới lăng kính Triết học Mác-Lênin, hãy viết một lời phê duyệt biện luận cho trận đấu tranh luận đối kháng giữa một Học giả (người chơi) và một KOL Phông bạt (đối thủ).\n" +
                "\n" +
                "Kết quả trận đấu:\n" +
                "- Kết quả: " + (isVictory ? "CHIẾN THẮNG" : "THẤT BẠI") + "\n" +
                "- HP còn lại của Học giả: " + playerHp + "/100\n" +
                "- HP còn lại của KOL: " + opponentHp + "/100\n" +
                "- Chỉ số thắng thế: " + winMarginPercentage + "%\n" +
                "- Danh hiệu: " + resultTitle + "\n" +
                "\n" +
                "Các phản biện người chơi đã sử dụng chống lại những phát ngôn thực dụng của KOL:\n" +
                argumentsText + "\n" +
                "\n" +
                "YÊU CẦU PHẢN HỒI:\n" +
                "1. Hãy đóng vai Karl Marx (giọng văn châm biếm, sắc bén, biện chứng, phê phán tư tưởng tư bản phông bạt một cách sâu sắc).\n" +
                "2. Nếu học giả CHIẾN THẮNG: hãy ca ngợi lập luận vững vàng, khả năng phân biệt rõ giá trị sử dụng và giá trị trao đổi, ý thức tiến bộ đã cải tạo tư tưởng tiêu dùng lệch lạc.\n" +
                "3. Nếu học giả THẤT BẠI: hãy phê bình nghiêm khắc nhưng mang tính giáo dục, chỉ ra họ bị cuốn theo lập luận thực dụng của đối thủ, nhắc nhở họ rằng 'tiền chỉ là vật ngang giá chung, không thể quyết định toàn bộ bản chất xã hội của con người'.\n" +
                "4. Viết bằng tiếng Việt, khoảng 250-350 từ, viết trôi chảy không có các tiêu đề markdown lớn.\n" +
                "5. Ở dòng cuối cùng, hãy ghi rõ: '[REHABILITATION]: ' tiếp theo là đề xuất một tài liệu triết học hoặc cuốn sách để củng cố tri thức.";

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
