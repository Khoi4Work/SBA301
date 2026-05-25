package com.philosophy.rag.base.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Collections;

@Configuration
public class UserDetails {
    @Bean
    public UserDetailsService userDetailsService() {
        return username -> {
            if ("admin".equals(username)) {
                return new User("admin", "{bcrypt}$2a$10$ExampleHash...",
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")));
            }
            throw new UsernameNotFoundException("User not found");
        };
    }
}
