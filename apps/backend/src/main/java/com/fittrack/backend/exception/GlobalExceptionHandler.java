package com.fittrack.backend.exception;

import com.fittrack.backend.dto.ApiErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Instant;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiErrorResponse> handleAppException(AppException ex, HttpServletRequest request) {
        logger.warn("Application exception: {} - {}", ex.getStatus(), ex.getMessage());
        return ResponseEntity.status(ex.getStatus())
                .body(new ApiErrorResponse(
                        Instant.now(),
                        ex.getStatus().value(),
                        ex.getStatus().name(),
                        ex.getMessage(),
                        request.getRequestURI(),
                        List.of()
                ));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        List<String> details = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .toList();

        logger.warn("Validation error at {}: {}", request.getRequestURI(), details);
        return ResponseEntity.badRequest().body(new ApiErrorResponse(
                Instant.now(),
                HttpStatus.BAD_REQUEST.value(),
                "VALIDATION_ERROR",
                "Invalid request data",
                request.getRequestURI(),
                details
        ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleUnexpected(Exception ex, HttpServletRequest request, WebRequest webRequest) {
        String errorMessage = "Something went wrong";
        
        // Log the full error for debugging
        logger.error("Unexpected error at {}", request.getRequestURI(), ex);
        
        // Check if it's a LazyInitializationException or similar Hibernate issue
        if (ex.getCause() != null) {
            String causeMessage = ex.getCause().getClass().getSimpleName();
            if ("LazyInitializationException".equals(causeMessage)) {
                errorMessage = "Data not available. Please try again.";
                logger.error("LazyInitializationException: " + ex.getMessage());
            }
        }
        
        // Don't expose the exact error message to clients for security
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiErrorResponse(
                        Instant.now(),
                        HttpStatus.INTERNAL_SERVER_ERROR.value(),
                        "INTERNAL_ERROR",
                        errorMessage,
                        request.getRequestURI(),
                        List.of()
                ));
    }
}

