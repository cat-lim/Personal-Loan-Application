package com.Group1.personalLoanApp.Controller;
import com.Group1.personalLoanApp.repository.*;

import jakarta.servlet.http.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

import org.springframework.http.*;
import org.springframework.security.authentication.*;
import org.springframework.security.core.*;
import org.springframework.security.core.context.*;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.csrf.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthenticationManager authManager;
    private final SecurityContextRepository contextRepository;
    private final CustomerRepository customers;
    private final LoanOfficerRepository officers;

    public AuthController(AuthenticationManager authManager, SecurityContextRepository contextRepository,CustomerRepository customers, LoanOfficerRepository officers){
        this.authManager = authManager;
        this.contextRepository = contextRepository;
        this.customers = customers;
        this.officers = officers;
    }

    public record LoginRequest(@NotBlank String username, @NotBlank String password){}

    @GetMapping("/csrf")
    public CsrfToken csrf(CsrfToken token){
        return token;
    }

    @PostMapping("/login")
    public Map<String, Object> login(
            @Valid @RequestBody LoginRequest body,
            HttpServletRequest request,
            HttpServletResponse response){

        Authentication authentication;

        try {
            authentication = authManager.authenticate(new UsernamePasswordAuthenticationToken(body.username(), body.password()));
        } catch (AuthenticationException ex){
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Invalid username or password"
            );
        }

        boolean isCustomer =
                authentication.getAuthorities().stream()
                        .anyMatch(a ->
                                a.getAuthority().equals("ROLE_CUSTOMER"));

        String role = isCustomer
                ? "CUSTOMER"
                : "OFFICER";

        Long userId;

        if(isCustomer){
            userId = customers
                    .findByUsername(authentication.getName())
                    .orElseThrow()
                    .getId();
        } else {
                userId = officers
                        .findByUsername(authentication.getName())
                        .orElseThrow()
                        .getId();
        }

        HttpSession session = request.getSession(true);
        request.changeSessionId();

        session.setAttribute("userId", userId);
        session.setAttribute("role", role);

        SecurityContext context =
                SecurityContextHolder.createEmptyContext();

        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);

        contextRepository.saveContext(context, request, response);

        new HttpSessionCsrfTokenRepository().saveToken(null, request, response);

        return Map.of(
                "userId", userId,
                "username", authentication.getName(),
                "role", role
        );
    }

    @GetMapping("/me")
    public Map<String, Object> me(HttpServletRequest request, Authentication authentication){
    HttpSession session = request.getSession(false);

    if (session == null || session.getAttribute("userId") == null){
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not logged in");
    }

    return Map.of(
            "userId", session.getAttribute("userId"),
            "username", authentication.getName(),
            "role", session.getAttribute("role")
        );
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response, Authentication authentication){

        new SecurityContextLogoutHandler().logout(request, response, authentication);

        return ResponseEntity.noContent().build();
    }
}
