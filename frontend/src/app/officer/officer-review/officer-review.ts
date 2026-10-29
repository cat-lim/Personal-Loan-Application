import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule
} from '@angular/forms';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import { OfficerService } from '../services/officer.service';

import type {
  OfficerApplication
} from '../models/officer-application.model';

@Component({
  selector: 'app-officer-review',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './officer-review.html',
  styleUrls: ['./officer-review.css']
})
export class OfficerReviewComponent
  implements OnInit {

  application?: OfficerApplication;

  decisionForm!: FormGroup;

  loading = false;
  saving = false;

  rejectionError = '';
  conflictMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private officerService: OfficerService,
    private cdr: ChangeDetectorRef
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

  loadApplication(id: number): void {

    this.loading = true;

    this.officerService
      .getApplication(id)
      .subscribe({
        next: (response) => {

          this.application = response;

          this.loading = false;

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(error);

          this.loading = false;

          this.handleError(error);
        }
      });
  }

  submitDecision(): void {

    this.rejectionError = '';
    this.errorMessage = '';

    if (
      this.decision === 'REJECTED' &&
      !this.reason.trim()
    ) {

      this.rejectionError =
        'A rejection reason is required.';

      return;
    }

    const application =
      this.application;

    if (!application) {
      return;
    }

    this.saving = true;

    const request =
      this.decision === 'APPROVED'
        ? this.officerService
            .approveApplication(
              application.id,
              this.reason
            )
        : this.officerService
            .rejectApplication(
              application.id,
              this.reason
            );

    request.subscribe({

      next: (response) => {

        console.log(
          'DECISION SUCCESS',
          response
        );

        this.saving = false;

        void this.router.navigate(
          ['/officer/queue'],
          {
            state: {
              successMessage:
                `${application.reference} ${this.decision.toLowerCase()}. The customer can now view the decision.`
            }
          }
        );
      },

      error: (error) => {

        console.error(error);

        this.handleError(error);
      }
    });
  }

  private handleError(
    error: any
  ): void {

    console.error(error);

    this.loading = false;
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

      this.errorMessage =
        'Please sign in as an officer.';

      return;
    }

    if (error.status === 403) {

      this.errorMessage =
        'You do not have permission to make decisions.';

      return;
    }

    if (error.status === 404) {

      this.errorMessage =
        'Application not found.';

      return;
    }

    this.errorMessage =
      `Request failed (${error.status}).`;
  }

  get decision(): string {

    return this.decisionForm.value
      .decision ?? '';
  }

  get reason(): string {

    return this.decisionForm.value
      .reason ?? '';
  }
}