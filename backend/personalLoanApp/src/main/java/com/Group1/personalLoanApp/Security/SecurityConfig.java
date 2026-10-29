package com.Group1.personalLoanApp.Security;

import com.Group1.personalLoanApp.repository.*;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.context.*;
import org.springframework.security.web.csrf.HttpSessionCsrfTokenRepository;
import org.springframework.web.cors.*;
import java.util.List;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;


@Configuration
@EnableMethodSecurity 
public class SecurityConfig {
    @Bean
    PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

    @Bean
    UserDetailsService userDetailsService(CustomerRepository customers, LoanOfficerRepository officers){
        return username -> {
            var customer = customers.findByUsername(username);

            if (customer.isPresent()){
                var c = customer.get();

                return User.withUsername(c.getUsername()).password(c.getPasswordHash()).roles("CUSTOMER").build();
            }

            var officer = officers.findByUsername(username);

            if (officer.isPresent()){
                var o = officer.get();
                return User.withUsername(o.getUsername()).password(o.getPasswordHash()).roles("OFFICER").build();
            }

            throw new UsernameNotFoundException("User not found");
        };
    }

    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration configuration)
        throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    SecurityContextRepository securityContextRepository(){
        return new HttpSessionSecurityContextRepository();
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, SecurityContextRepository repository)
        throws Exception{
        http
                .cors(cors ->{})
                .csrf(csrf -> csrf.csrfTokenRepository(new HttpSessionCsrfTokenRepository()))
                // .csrf(AbstractHttpConfigurer::disable)
                .securityContext(context ->
                        context.securityContextRepository(repository)).authorizeHttpRequests(auth ->
                        auth.requestMatchers(
                                HttpMethod.GET, "/api/auth/csrf").permitAll()
                                .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                                .requestMatchers("/api/auth/me", "/api/auth/logout").authenticated()
                                .requestMatchers(
                                        HttpMethod.POST, "/api/loans/submit").hasRole("CUSTOMER")
                                .requestMatchers("/api/applications/**").hasRole("CUSTOMER") //Customer RBAC
                                .requestMatchers("/api/officer/applications/**").hasRole("OFFICER") //Officer RBAC
                                // .requestMatchers("/api/officer/applications/**").permitAll()
                                .anyRequest().permitAll()
                                )
                                .exceptionHandling(errors ->
                                        errors.authenticationEntryPoint(
                                                new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
                                        )
                                                .formLogin(AbstractHttpConfigurer::disable)
                                                .httpBasic(AbstractHttpConfigurer::disable);
                                return http.build();
    }
    @Bean
    CorsConfigurationSource corsConfigurationSource(){
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of("http://localhost:4200"));
        config.setAllowedMethods(List.of("GET","POST", "OPTIONS"));
        config.setAllowedHeaders(List.of("Content-Type", "Idempotency-Key", "X-CSRF-TOKEN"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}
