package com.food.order.config;

import com.food.order.entity.Role;
import com.food.order.entity.User;
import com.food.order.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds default accounts on every startup.
 * This is essential for H2 in-memory DB (data is wiped on restart).
 *
 * Accounts created:
 *   Admin:      admin@gmail.com  / admin
 *   Demo User:  user@demo.com    / demo123
 */
@Component
public class DataInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        seedUser("admin@gmail.com", "Admin", "admin", Role.ADMIN);
        seedUser("user@demo.com", "Demo User", "demo123", Role.USER);
        log.info("[DataInitializer] Default accounts seeded successfully.");
    }

    private void seedUser(String email, String name, String password, Role role) {
        if (userRepository.findByEmail(email).isEmpty()) {
            User user = new User(name, email, passwordEncoder.encode(password), role);
            userRepository.save(user);
            log.info("[DataInitializer] Created {} account: {}", role, email);
        }
    }
}
