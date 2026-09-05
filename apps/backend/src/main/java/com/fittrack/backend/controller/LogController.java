package com.fittrack.backend.controller;

import com.fittrack.backend.dto.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/logs")
@RequiredArgsConstructor
public class LogController {

    @Value("${logging.file.path:logs}")
    private String logPath;

    @GetMapping
    public ResponseEntity<ApiResponse<List<String>>> listLogs() {
        try {
            File logsDir = new File(logPath);
            if (!logsDir.exists()) {
                return ResponseEntity.ok(ApiResponse.success(new ArrayList<>()));
            }

            List<String> logFiles = new ArrayList<>();
            File[] files = logsDir.listFiles((dir, name) -> name.endsWith(".log"));
            if (files != null) {
                for (File file : files) {
                    logFiles.add(file.getName() + " (" + formatFileSize(file.length()) + ")");
                }
            }

            log.info("Listed {} log files", logFiles.size());
            return ResponseEntity.ok(ApiResponse.success("Log files retrieved", logFiles));
        } catch (Exception e) {
            log.error("Error listing logs", e);
            return ResponseEntity.ok(ApiResponse.error("ERROR", "Failed to list logs: " + e.getMessage()));
        }
    }

    @GetMapping("/{filename}")
    public ResponseEntity<?> downloadLog(@PathVariable String filename) {
        try {
            // Prevent directory traversal
            if (filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("INVALID_FILENAME", "Invalid filename"));
            }

            Path filePath = Paths.get(logPath, filename);
            File file = filePath.toFile();

            if (!file.exists()) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = new FileSystemResource(file);

            log.info("Downloading log file: {}", filename);
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.TEXT_PLAIN)
                .contentLength(file.length())
                .body(resource);
        } catch (Exception e) {
            log.error("Error downloading log: {}", filename, e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("ERROR", "Failed to download log: " + e.getMessage()));
        }
    }

    @GetMapping("/{filename}/tail")
    public ResponseEntity<ApiResponse<List<String>>> tailLog(@PathVariable String filename) {
        try {
            // Prevent directory traversal
            if (filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("INVALID_FILENAME", "Invalid filename"));
            }

            Path filePath = Paths.get(logPath, filename);
            File file = filePath.toFile();

            if (!file.exists()) {
                return ResponseEntity.notFound().build();
            }

            List<String> lines = Files.readAllLines(filePath);
            int lineCount = lines.size();

            // Return last 100 lines
            List<String> lastLines = lines.stream()
                .skip(Math.max(0, lineCount - 100))
                .collect(Collectors.toList());

            log.info("Retrieved last {} lines from {}", lastLines.size(), filename);
            return ResponseEntity.ok(ApiResponse.success("Last 100 lines", lastLines));
        } catch (IOException e) {
            log.error("Error reading log file: {}", filename, e);
            return ResponseEntity.ok(ApiResponse.error("ERROR", "Failed to read log: " + e.getMessage()));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<String>> getLogStats() {
        try {
            File logsDir = new File(logPath);
            if (!logsDir.exists()) {
                return ResponseEntity.ok(ApiResponse.success("No logs directory"));
            }

            File[] files = logsDir.listFiles((dir, name) -> name.endsWith(".log"));
            if (files == null) {
                return ResponseEntity.ok(ApiResponse.success("No log files"));
            }

            long totalSize = 0;
            int fileCount = files.length;
            for (File file : files) {
                totalSize += file.length();
            }

            String stats = String.format("Log Files: %d, Total Size: %s", fileCount, formatFileSize(totalSize));
            return ResponseEntity.ok(ApiResponse.success(stats));
        } catch (Exception e) {
            log.error("Error getting log stats", e);
            return ResponseEntity.ok(ApiResponse.error("ERROR", "Failed to get stats: " + e.getMessage()));
        }
    }

    private String formatFileSize(long bytes) {
        if (bytes <= 0) return "0 B";
        final String[] units = new String[]{"B", "KB", "MB", "GB"};
        int digitGroups = (int) (Math.log10(bytes) / Math.log10(1024));
        return String.format("%.1f %s", bytes / Math.pow(1024, digitGroups), units[digitGroups]);
    }
}

