package com.fittrack.backend.exception;

public class BusinessLogicException extends RuntimeException {
    private String code;

    public BusinessLogicException(String message) {
        super(message);
        this.code = "BUSINESS_LOGIC_ERROR";
    }

    public BusinessLogicException(String code, String message) {
        super(message);
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}

