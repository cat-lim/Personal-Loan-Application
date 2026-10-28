import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule
} from '@angular/forms';

import { CommonModule } from '@angular/common';
import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { OfficerService } from '../services/officer.service';
import type { OfficerApplication } from '../models/officer-application.model';

@Component({
  selector: 'app-officer-review',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './officer-review.html',
  styleUrls: []
})

export class OfficerReviewComponent implements OnInit {
  application?: OfficerApplication;

  decisionForm!: FormGroup;

  saving = false;

  rejectionError = '';
  conflictMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private officerService: OfficerService
  ) {}

  ngOnInit(): void {

    this.decisionForm = this.fb.group({
      decision: ['APPROVED'],
      reason: ['']
    });

    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );

    this.loadApplication(id);
  }

  // loadApplication(id: number): void {
    //   this.officerService
    //     .getApplication(id)
    //     .subscribe({
    //       next: (response) => {
    //         this.application = response;
    //       },
    //       error: (error) => {
    //         this.handleError(error);
    //       }
    //     });
    // }

  loadApplication(id: number): void {
    // Replace with API call
    this.application = {
      id,
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
    };
  }

  // submitDecision(): void {

  //   this.rejectionError = '';
  //   this.errorMessage = '';

  //   if (
  //     this.decision === 'REJECTED' &&
  //     !this.reason.trim()
  //   ) {
  //     this.rejectionError =
  //       'A rejection reason is required.';
  //     return;
  //   }

  //   if (!this.application) {
  //     return;
  //   }

  //   this.saving = true;

  //   const request =
  //     this.decision === 'APPROVED'
  //       ? this.officerService.approveApplication(
  //           this.application.id,
  //           this.reason
  //         )
  //       : this.officerService.rejectApplication(
  //           this.application.id,
  //           this.reason
  //         );

  //   request.subscribe({
  //     next: () => {
  //       this.officerService.removeApplication(
  //         this.application.id
  //       );

  //       this.router.navigate(
  //         ['/officer/queue'],
  //         {
  //           state: {
  //             successMessage:
  //               `${this.application.reference} ${this.decision.toLowerCase()}. The customer can now view the decision.`
  //           }
  //         }
  //       );
  //     },
  //     error: (error) => {
  //       this.handleError(error);
  //     }
  //   });
  // }

  submitDecision(): void {

    this.rejectionError = '';
    this.errorMessage = '';

    if (this.decision === 'REJECTED' && !this.reason.trim()) {
      this.rejectionError ='A rejection reason is required.';
      return;
    }

    if (!this.application) {
      return;
    }

    const application = this.application;

    this.saving = true;

    // For demo purposes while API is not connected
    this.officerService.removeApplication(
      application.id
    );

    this.router.navigate(
      ['/officer/queue'],
      {
        state: {
          successMessage:
            `${application.reference} ${this.decision.toLowerCase()}. The customer can now view the decision.`
        }
      }
    );
  }

  private handleError(error: any): void {

    this.saving = false;

    if (error.status === 409) {

      this.conflictMessage =
        'Another officer already processed this application.';

      setTimeout(() => {
        this.router.navigate([
          '/officer/queue'
        ]);
      }, 1500);

      return;
    }

    if (error.status === 400) {
      this.errorMessage =
        error.error?.message ??
        'Validation failed.';
      return;
    }

    if (error.status === 401) {
      this.errorMessage = 'Your session has expired.';
      return;
    }

    if (error.status === 403) {
      this.errorMessage = 'Only officers may make decisions.';
      return;
    }

    if (error.status === 404) {
      this.errorMessage = 'Application not found.';
      return;
    }

    this.errorMessage =
      'Unable to save decision.';
  }

  get decision(): string {
    return this.decisionForm.value.decision ?? '';
  }

  get reason(): string {
    return this.decisionForm.value.reason ?? '';
  }
}