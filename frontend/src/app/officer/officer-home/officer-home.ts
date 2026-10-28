import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';

import { OfficerService } from '../services/officer.service';
import type { OfficerApplication } from '../models/officer-application.model';

@Component({
  selector: 'app-officer-queue',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './officer-home.html',
  styleUrls: []
})
export class OfficerQueueComponent implements OnInit {

  applications: OfficerApplication[] = [];

  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private officerService: OfficerService,
    private router: Router
  ) {}

  ngOnInit(): void {

    const state = history.state;

    if (state && state.successMessage) {
      this.successMessage = state.successMessage;
    }
    console.log(history.state);
    this.loadQueue();
  }

  loadQueue(): void {

  this.loading = false;

  this.applications = [
  {
    id: 1,
    reference: 'PL-001',
    applicantName: 'John Smith',
    applicantUsername: 'jsmith',
    loanAmount: 15000,
    termMonths: 24,
    purpose: 'Debt Consolidation',
    employmentStatus: 'FULL_TIME',
    monthlyIncome: 5000,
    status: 'SUBMITTED',
    submittedAt: new Date().toISOString(),
    decisionNote: null,
    decidedAt: null,
    decisionOfficerName: null
  },
  {
    id: 2,
    reference: 'PL-002',
    applicantName: 'Sarah Johnson',
    applicantUsername: 'sjohnson',
    loanAmount: 25000,
    termMonths: 36,
    purpose: 'Home Improvement',
    employmentStatus: 'FULL_TIME',
    monthlyIncome: 7200,
    status: 'SUBMITTED',
    submittedAt: new Date().toISOString(),
    decisionNote: null,
    decidedAt: null,
    decisionOfficerName: null
  }
];
}

  // loadQueue(): void {
  //   this.loading = true;
  //   this.errorMessage = '';

  //   this.officerService.getPendingQueue().subscribe({
  //     next: (response) => {
  //       console.log('QUEUE RESPONSE: ', response);

  //       this.applications = response;
  //       this.loading = false;
  //     },
  //     error: (error) => {
  //       console.error('QUEUE ERROR: ', error);

  //       this.loading = false;
  //       this.errorMessage =
  //         'Unable to load pending applications.';
  //     }
  //   });
  // }
}