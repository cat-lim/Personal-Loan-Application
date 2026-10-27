import {Component, inject} from '@angular/core';
import {LoanService} from '../loanservice/loanservice';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';

@Component({
  selector: 'app-loanapplication',
  imports: [ReactiveFormsModule],
  template: `
      <section class="listing-apply">
        <h2 class="section-heading">Apply for a personal loan</h2>

        <form [formGroup]="applyForm" (ngSubmit)="submitApplication()">

          <label for="loan-amount">Loan Amount (USD)</label>
          <input id="loan-amount" name="number" type="number" min="1000" max="50000" step="1" formControlName="loanAmount" required>
            
          <!-- Error messages for loan amount -->
          @if (showControlError(applyForm.controls.loanAmount)) {
            <p id="loan-amount-error" class="form-error">
              @if (applyForm.controls.loanAmount.hasError('required')) {
                Enter a loan amount.
              } @else if (applyForm.controls.loanAmount.hasError('min')) {
                The minimum loan amount is $1,000.
              } @else if (applyForm.controls.loanAmount.hasError('max')) {
                The maximum loan amount is $50,000.
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
            <option value="employed">Employed</option>
            <option value="self-employed">Self-Employed</option>
            <option value="retired">Retired</option>
            <option value="other">Other</option>
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

          <button type="submit">Submit Application</button>
        </form>
      </section>
  `,
  styleUrls: ['../loanapply/loanapply.css']
})

export class LoanApplication {
  loanService = inject(LoanService);
  applyForm = new FormGroup({
    loanAmount: new FormControl('', [
      Validators.required,
      Validators.min(1000),
      Validators.max(50000),
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

  showControlError(control: FormControl): boolean {
    return control.invalid && (control.touched || this.submitted);
  }

  submitApplication() {
    this.submitted = true;
    this.applyForm.markAllAsTouched();

    if (this.applyForm.invalid) {
      return;
    }

    // In the case that the received values are null/undefined, this sets it to '' instead
    this.loanService.submitApplication(
      this.applyForm.value.loanAmount ?? '',
      this.applyForm.value.loanTerm ?? '',
      this.applyForm.value.loanPurpose ?? '',
      this.applyForm.value.employmentStatus ?? '',
      this.applyForm.value.monthlyIncome ?? ''
    );
  }
}