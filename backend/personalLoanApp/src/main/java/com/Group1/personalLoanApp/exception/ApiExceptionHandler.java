package com.Group1.personalLoanApp.exception;
import org.springframework.http.*;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String,Object>> validation(MethodArgumentNotValidException ex){

        Map<String, String> fields = new LinkedHashMap<>();

        for(FieldError error:
                  ex.getBindingResult().getFieldErrors()){

            String field = error.getField();
            if ("validTerm".equals(field)){
                        field = "termMonths";
            }
            fields.putIfAbsent(
                            field, error.getDefaultMessage()
            );
        }
        return ResponseEntity.badRequest().body(
                Map.of(
                        "error", "VALIDATION_ERROR",
                        "fields", fields
                )
        );
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> statusError(
            ResponseStatusException ex){

        return ResponseEntity.status(ex.getStatusCode())
                .body(Map.of(
                        "error", ex.getStatusCode().toString(),
                        "message", ex.getReason() == null
                                ? "Request failed"
                                : ex.getReason()
                ));
    }
}
