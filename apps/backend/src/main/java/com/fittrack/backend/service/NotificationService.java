package com.fittrack.backend.service;

import com.fittrack.backend.dto.NotificationDTO;
import com.fittrack.backend.entity.Notification;
import com.fittrack.backend.entity.User;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fittrack.backend.exception.AppException;
import com.fittrack.backend.repository.NotificationRepository;
import com.fittrack.backend.repository.UserRepository;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public List<NotificationDTO> listNotifications(String email) {
        User user = findUser(email);
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<NotificationDTO> listUnreadNotifications(String email) {
        User user = findUser(email);
        return notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public long unreadCount(String email) {
        User user = findUser(email);
        return notificationRepository.countByUserIdAndReadFalse(user.getId());
    }

    @Transactional
    public NotificationDTO markAsRead(String email, Long notificationId) {
        User user = findUser(email);
        Notification notification = notificationRepository.findByIdAndUserId(notificationId, user.getId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Notification not found"));

        if (!notification.isRead()) {
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
        }

        return toDto(notificationRepository.save(notification));
    }

    @Transactional
    public void markAllAsRead(String email) {
        User user = findUser(email);
        notificationRepository.markAllAsReadForUser(user.getId());
    }

    @Transactional
    public void deleteNotification(String email, Long notificationId) {
        User user = findUser(email);
        long deleted = notificationRepository.deleteByIdAndUserId(notificationId, user.getId());
        if (deleted == 0) {
            throw new AppException(HttpStatus.NOT_FOUND, "Notification not found");
        }
    }

    @Transactional
    public NotificationDTO createNotification(User user, String type, String title, String message, Object data) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setData(data == null ? null : objectMapper.valueToTree(data));
        notification.setRead(false);

        return toDto(notificationRepository.save(notification));
    }

    @Transactional(readOnly = true)
    public Map<String, Long> unreadCountPayload(String email) {
        return Map.of("count", unreadCount(email));
    }

    private User findUser(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private NotificationDTO toDto(Notification notification) {
        return NotificationDTO.builder()
                .id(notification.getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .data(notification.getData())
                .read(notification.isRead())
                .readAt(notification.getReadAt())
                .createdAt(LocalDateTime.ofInstant(notification.getCreatedAt(), ZoneId.systemDefault()))
                .build();
    }
}

