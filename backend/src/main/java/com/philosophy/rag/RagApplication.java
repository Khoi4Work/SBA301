package com.philosophy.rag;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.Locale;
import java.util.TimeZone;

@SpringBootApplication
@EnableJpaAuditing(auditorAwareRef = "auditAwareImpl")
@EnableJpaRepositories
public class RagApplication {
    public static void main(String[] args) {
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        Locale.setDefault(new Locale("vi", "VN"));
        SpringApplication.run(RagApplication.class, args);
    }

    @Bean
    public CommandLineRunner dropCheckConstraint(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                jdbcTemplate.execute("ALTER TABLE quizzes DROP CONSTRAINT IF EXISTS quizzes_quiz_type_check;");
                System.out.println("=== Dropped constraint quizzes_quiz_type_check successfully ===");
            } catch (Exception e) {
                System.err.println("=== Failed to drop constraint quizzes_quiz_type_check: " + e.getMessage() + " ===");
            }
        };
    }
}
