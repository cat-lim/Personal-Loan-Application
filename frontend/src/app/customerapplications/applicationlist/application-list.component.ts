import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ApplicationSummary } from '../models/application.model';
import { CustomerApplicationService } from '../services/customer-application.service';

@Component({
  selector: 'app-application-list',
  templateUrl: './application-list.component.html',
  styleUrls: ['./application-list.component.scss']
})
export class CustomerApplication implements OnInit {

  applications: ApplicationSummary[] = [];
  loading = false;

  constructor(
    private applicationService: CustomerApplicationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.loading = true;

    this.applicationService
      .getApplications()
      .subscribe({
        next: (data) => {
          this.applications = data;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  viewDetails(applicationId: string): void {
    this.router.navigate(
      ['/customer-applications', applicationId]
    );
  }
}