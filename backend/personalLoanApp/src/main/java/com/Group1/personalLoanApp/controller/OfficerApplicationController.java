package com.Group1.personalLoanApp.Controller;

import com.Group1.personalLoanApp.dto.OfficerApplication;
import com.Group1.personalLoanApp.Service.OfficerApplicationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/officer/applications")
public class OfficerApplicationController
{
    private final OfficerApplicationService service;

    public OfficerApplicationController(OfficerApplicationService service)
    {
        this.service = service;
    }

    @GetMapping
    public List<OfficerApplication> getPendingApplications()
    {
        return service.getPendingApplications();
    }

    @GetMapping("/{applicationId}")
    public OfficerApplication getApplication(@PathVariable Long applicationId) {
        return service.getApplication(applicationId);
    }
}