import {Component, inject} from '@angular/core';
import {EmploymentStatus, LoanService} from '../loanservice/loanservice';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';
import {finalize, TimeoutError} from 'rxjs';
import {Router, RouterLink} from '@angular/router';

interface SubmissionErrorBody {
  message?: unknown;
  fields?: unknown;
}

const validationFieldLabels: Record<string, string> = {
  amount: 'Loan amount',
  termMonths: 'Loan term',
  validTerm: 'Loan term',
  purpose: 'Loan purpose',
  employmentStatus: 'Employment status',
  monthlyIncome: 'Monthly income',
};

@Component({
  selector: 'app-loanapplication',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
      <section class="listing-apply">
        <a class="back-button" routerLink="/customer/home">Back to applications</a>
        <h2 class="section-heading">Apply for a personal loan</h2>

        <form [formGroup]="applyForm" (ngSubmit)="submitApplication()">

          <label for="loan-amount">Loan Amount (USD)</label>
          <input id="loan-amount" name="number" type="number" min="1000" max="50000" step="0.01" formControlName="loanAmount" required>
            
          <!-- Error messages for loan amount -->
          @if (showControlError(applyForm.controls.loanAmount)) {
            <p id="loan-amount-error" class="form-error">
              @if (applyForm.controls.loanAmount.hasError('required')) {
                Enter a loan amount.
              } @else if (applyForm.controls.loanAmount.hasError('min')) {
                The minimum loan amount is $1,000.
              } @else if (applyForm.controls.loanAmount.hasError('max')) {
                The maximum loan amount is $50,000.
              } @else if (applyForm.controls.loanAmount.hasError('pattern')) {
                Enter no more than two decimal places.
              }
            </p>
          }
          
          <label for="loan-term">Loan Term</label>
          <select id="loan-term" formControlName="loanTerm" required>
            <option value="12">12 months</option>
            <option value="24">24 months</option>
            <option value="36">36 months</option>
          </select>

          <!-- Error message for loan term -->
          @if (showControlError(applyForm.controls.loanTerm)) {
            <p id="loan-term-error" class="form-error">Choose a loan term.</p>
          }

          <label for="loan-purpose">Loan Purpose</label>
          <input id="loan-purpose" type="text" formControlName="loanPurpose" required>

          <!-- Error message for loan purpose -->
          @if (showControlError(applyForm.controls.loanPurpose)) {
            <p id="loan-purpose-error" class="form-error">Enter a loan purpose.</p>
          }

          <label for="employment-status">Employment Status</label>
          <select id="employment-status" formControlName="employmentStatus" required>
            <option value="EMPLOYED">Employed</option>
            <option value="SELF_EMPLOYED">Self-Employed</option>
            <option value="RETIRED">Retired</option>
            <option value="OTHER">Other</option>
          </select>

          <!-- Error message for employment status -->
          @if (showControlError(applyForm.controls.employmentStatus)) {
            <p id="employment-status-error" class="form-error">Choose an employment status.</p>
          }

          <label for="monthly-income">Monthly Income (USD)</label>
          <input id="monthly-income" name="number" type="number" min="0" step="1" formControlName="monthlyIncome" required>
          
          <!-- Error messages for monthly income -->
          @if (showControlError(applyForm.controls.monthlyIncome)) {
            <p id="monthly-income-error" class="form-error">
              @if (applyForm.controls.monthlyIncome.hasError('required')) {
                Enter your monthly income.
              } @else if (applyForm.controls.monthlyIncome.hasError('min')) {
                Monthly income cannot be less than $0.
              }
            </p>
          }
          
          @if (submitted && applyForm.invalid) {
            <p class="form-error" role="alert">
              Please correct the form errors before submitting your application.
            </p>
          }

          @if (submissionError) {
            <p class="form-error" role="alert">{{ submissionError }}</p>
          }

          <div class="form-actions">
            <button type="button" class="cancel-button" routerLink="/customer/home"
              [disabled]="submissionPending || applicationSubmitted">
              Cancel
            </button>
            <button type="submit" [disabled]="submissionPending || applicationSubmitted">
              {{ submissionPending ? 'Submitting...' : applicationSubmitted ? 'Application submitted' : 'Submit Application' }}
            </button>
          </div>
        </form>
      </section>
  `,
  styleUrls: ['../loanapply/loanapply.css']
})

export class LoanApplication {
  loanService = inject(LoanService);
  private readonly router = inject(Router);
  applyForm = new FormGroup({
    loanAmount: new FormControl('', [
      Validators.required,
      Validators.min(1000),
      Validators.max(50000),
      Validators.pattern(/^\d+(\.\d{1,2})?$/),
    ]),
    loanTerm: new FormControl('', Validators.required),
    loanPurpose: new FormControl('', Validators.required),
    employmentStatus: new FormControl('', Validators.required),
    monthlyIncome: new FormControl('', [
      Validators.required,
      Validators.min(0),
    ]),
  });
  submitted = false;
  submissionPending = false;
  applicationSubmitted = false;
  submissionError = '';

  showControlError(control: FormControl): boolean {
    return control.invalid && (control.touched || this.submitted);
  }

  submitApplication() {
    this.submitted = true;
    this.applyForm.markAllAsTouched();

    if (this.applyForm.invalid || this.submissionPending || this.applicationSubmitted) {
      return;
    }

    this.submissionPending = true;
    this.submissionError = '';

    this.loanService.submitApplication({
      amount: Number(this.applyForm.value.loanAmount),
      termMonths: Number(this.applyForm.value.loanTerm),
      purpose: this.applyForm.value.loanPurpose ?? '',
      employmentStatus: this.applyForm.value.employmentStatus as EmploymentStatus,
      monthlyIncome: Number(this.applyForm.value.monthlyIncome),
    }).pipe(finalize(() => {
      this.submissionPending = false;
    })).subscribe({
      next: (response) => {
        this.submissionPending = false;
        this.applicationSubmitted = true;
        void this.router.navigate(['/customer/home'], {
          state: {applicationReference: response.reference},
        });
      },
      error: (error: HttpErrorResponse | TimeoutError) => {
        if (error instanceof TimeoutError) {
          this.submissionError = 'The backend did not respond within 20 seconds. Please try again.';
        } else if (error.status === 401) {
          this.submissionError = 'Your login session expired. Please log in again.';
        } else if (error.status === 403) {
          this.submissionError = 'Your session could not be authorized. Please sign in again with a customer account.';
        } else if (error.status === 409) {
          this.submissionError = 'This request conflicts with an earlier submission. Refresh your applications and try again.';
        } else if (error.status === 400) {
          this.submissionError = this.getBadRequestMessage(error.error);
        } else if (error.status === 0) {
          this.submissionError = 'Unable to reach the backend. Please ensure it is running.';
        } else if (error.status >= 500) {
          this.submissionError = 'The server encountered a problem while saving your application. Please try again later.';
        } else {
          this.submissionError = `The application could not be submitted (error ${error.status}). Please try again.`;
        }
      },
    });
  }

  private getBadRequestMessage(response: unknown): string {
    if (!this.isErrorBody(response)) {
      return 'The server rejected the application. Check the form values and try again.';
    }

    if (this.isRecord(response.fields)) {
      const fieldErrors = Object.entries(response.fields)
        .filter((entry): entry is [string, string] => typeof entry[1] === 'string')
        .map(([field, message]) => {
          const label = validationFieldLabels[field] ?? 'Application detail';
          return `${label}: ${message}`;
        });

      if (fieldErrors.length > 0) {
        return `Please correct the following and try again: ${fieldErrors.join(' ')}`;
      }
    }

    if (typeof response.message === 'string' && response.message.trim()) {
      return response.message;
    }

    return 'The server rejected the application. Check the form values and try again.';
  }

  private isErrorBody(value: unknown): value is SubmissionErrorBody {
    return this.isRecord(value);
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}