package com.fittrack.backend.service.impl;

import com.fittrack.backend.dto.AppSettingsResponse;
import com.fittrack.backend.dto.UpdateSettingsRequest;
import com.fittrack.backend.entity.User;
import com.fittrack.backend.entity.UserSetting;
import com.fittrack.backend.exception.AppException;
import com.fittrack.backend.repository.UserRepository;
import com.fittrack.backend.repository.UserSettingRepository;
import com.fittrack.backend.service.SettingsService;
import jakarta.transaction.Transactional;
import java.time.LocalTime;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@Transactional
public class SettingsServiceImpl implements SettingsService {

    private final UserRepository userRepository;
    private final UserSettingRepository userSettingRepository;

    public SettingsServiceImpl(UserRepository userRepository, UserSettingRepository userSettingRepository) {
        this.userRepository = userRepository;
        this.userSettingRepository = userSettingRepository;
    }

    @Override
    public AppSettingsResponse getSettings(String email) {
        User user = findUser(email);
        UserSetting settings = userSettingRepository.findByUserId(user.getId()).orElseGet(() -> createDefaults(user));
        return toResponse(settings);
    }

    @Override
    public AppSettingsResponse updateSettings(String email, UpdateSettingsRequest request) {
        User user = findUser(email);
        UserSetting settings = userSettingRepository.findByUserId(user.getId()).orElseGet(() -> createDefaults(user));

        settings.setReminderEnabled(request.reminderEnabled());
        settings.setReminderTime(request.reminderTime());
        settings.setUnitSystem(request.unitSystem());
        settings.setWeeklyGoal(request.weeklyGoal());

        return toResponse(userSettingRepository.save(settings));
    }

    private UserSetting createDefaults(User user) {
        UserSetting settings = new UserSetting();
        settings.setUser(user);
        settings.setReminderEnabled(true);
        settings.setReminderTime(LocalTime.of(7, 30));
        return userSettingRepository.save(settings);
    }

    private AppSettingsResponse toResponse(UserSetting settings) {
        return new AppSettingsResponse(
                settings.isReminderEnabled(),
                settings.getReminderTime().toString(),
                settings.getUnitSystem().name(),
                settings.getWeeklyGoal()
        );
    }

    private User findUser(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "User not found"));
    }
}

