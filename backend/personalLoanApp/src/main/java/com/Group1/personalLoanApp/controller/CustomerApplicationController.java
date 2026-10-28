package com.Group1.personalLoanApp.controller;

import com.Group1.personalLoanApp.dto.CustomerApplication;
import com.Group1.personalLoanApp.service.CustomerApplicationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/**
 * customerId is retrieved from the user's session on Application requests.
 * If it doesn't match the Application's customerId, the repository will
 * reject the request in CustomerApplicationService.
 */
@RestController
@RequestMapping("/api/applications")
public class CustomerApplicationController
{
    private final CustomerApplicationService service;

    public CustomerApplicationController(CustomerApplicationService service)
    {
        this.service = service;
    }

    @GetMapping
    public List<CustomerApplication> getApplications(HttpServletRequest request)
    {
        Long customerId = getCustomerIdFromSession(request.getSession(false));
        return service.getApplications(customerId);
    }

    @GetMapping("/{applicationId}")
    public CustomerApplication getApplication(
            @PathVariable Long applicationId,
            HttpServletRequest request
    ) {
        Long customerId = getCustomerIdFromSession(request.getSession(false));
        return service.getApplication(customerId, applicationId);
    }

    private Long getCustomerIdFromSession(HttpSession session)
    {
        if (session == null || !(session.getAttribute("userId") instanceof Long customerId)){
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required");
        }
        return customerId;
    }
}
