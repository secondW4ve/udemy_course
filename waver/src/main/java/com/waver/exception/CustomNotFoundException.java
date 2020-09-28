package com.waver.exception;

public class CustomNotFoundException extends RuntimeException {

    private String errorMessage;

    public CustomNotFoundException(String errorMessage){
        super();
        this.errorMessage = errorMessage;
    }
}
