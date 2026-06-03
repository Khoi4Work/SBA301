package com.philosophy.rag.base.security;

import com.philosophy.rag.entity.User;
import com.philosophy.rag.repository.custom.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import java.util.Collections;

@Configuration
@RequiredArgsConstructor
public class UserDetails {

    private final UserRepository userRepository;

    @Bean
    public UserDetailsService userDetailsService() {
        return usernameOrEmail  -> {
            User user = userRepository
                    .findByUsername(usernameOrEmail)
                    .or(() -> userRepository.findByEmail(usernameOrEmail))
                    .orElseThrow(() ->
                            new UsernameNotFoundException(
                                    "User not found: " + usernameOrEmail));
            return new org.springframework.security.core.userdetails.User(
                    user.getUsername(),
                    user.getPasswordHash(),
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
            );
        };
    }
}