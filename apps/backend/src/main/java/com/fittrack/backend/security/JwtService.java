package com.fittrack.backend.security;

import jakarta.annotation.PostConstruct;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.security.Key;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Arrays;
import java.util.Date;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.access-expiration-minutes:30}")
    private long accessTokenExpirationMinutes;

    private final Environment environment;
    private Key signingKey;

    public JwtService(Environment environment) {
        this.environment = environment;
    }

    @PostConstruct
    void initializeSigningKey() {
        if (StringUtils.hasText(jwtSecret)) {
            signingKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
            return;
        }

        boolean prodProfileActive = Arrays.stream(environment.getActiveProfiles())
            .anyMatch("prod"::equalsIgnoreCase);

        if (prodProfileActive) {
            throw new IllegalStateException("JWT_SECRET is required when running with the prod profile");
        }

        byte[] secretBytes = new byte[64];
        new SecureRandom().nextBytes(secretBytes);
        signingKey = Keys.hmacShaKeyFor(secretBytes);
        log.warn("JWT_SECRET is not configured. Using an in-memory JWT signing key for this runtime only.");
    }

    public String generateAccessToken(String subject, Map<String, Object> claims) {
        return buildToken(subject, claims, Duration.ofMinutes(accessTokenExpirationMinutes));
    }

    public String generateRefreshToken(String subject, boolean rememberSession) {
        long days = rememberSession ? 30 : 7;
        return buildToken(subject, Map.of("type", "refresh"), Duration.ofDays(days));
    }

    public Duration getAccessTokenTtl() {
        return Duration.ofMinutes(accessTokenExpirationMinutes);
    }

    public String extractSubject(String token) {
        return parseClaims(token).getSubject();
    }

    public boolean isValid(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (Exception ignored) {
            return false;
        }
    }

    public Instant extractExpiration(String token) {
        return parseClaims(token).getExpiration().toInstant();
    }

    private String buildToken(String subject, Map<String, Object> claims, Duration ttl) {
        Instant now = Instant.now();
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(now.plus(ttl)))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key getSigningKey() {
        return signingKey;
    }
}

