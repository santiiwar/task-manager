package com.sguerra.taskmanager.auth;

import com.sguerra.taskmanager.user.User;
import com.sguerra.taskmanager.user.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository users;
    private final BCryptPasswordEncoder encoder;
    private final JwtUtil jwt;

    public AuthService(UserRepository users, BCryptPasswordEncoder encoder, JwtUtil jwt) {
        this.users = users;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    public String register(String username, String email, String password) {
        if (users.existsByEmail(email)) throw new IllegalArgumentException("El email ya está registrado");
        if (users.existsByUsername(username)) throw new IllegalArgumentException("El usuario ya existe");

        var user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(encoder.encode(password));
        users.save(user);

        return jwt.generate(user.getId(), user.getUsername());
    }

    public String login(String email, String password) {
        var user = users.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Credenciales inválidas"));

        if (!encoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("Credenciales inválidas");
        }

        return jwt.generate(user.getId(), user.getUsername());
    }
}
