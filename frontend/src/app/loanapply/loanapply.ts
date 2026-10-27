import {Component, inject} from '@angular/core';
import {LoanService} from '../loanservice/loanservice';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-loanapplication',
  imports: [ReactiveFormsModule],
  template: `
      <section class="listing-apply">
        <h2 class="section-heading">Apply for a loan</h2>

        <form [formGroup]="applyForm" (ngSubmit)="submitApplication()">

          <label for="loan-amount">Loan Amount (USD) </label>
          <input id="loan-amount" name="number" type="number" min="1000" max="50000" step="1" formControlName="loanAmount" />
          
          <label for="loan-term">Loan Term</label>
          <select id="loan-term" formControlName="loanTerm">
            <option value="12">12 months</option>
            <option value="24">24 months</option>
            <option value="36">36 months</option>
          </select>

          <label for="loan-purpose">Loan Purpose</label>
          <input id="loan-purpose" type="text" formControlName="loanPurpose" />

          <label for="employment-status">Employment Status</label>
          <select id="employment-status" formControlName="employmentStatus">
            <option value="employed">Employed</option>
            <option value="self-employed">Self-Employed</option>
            <option value="retired">Retired</option>
            <option value="other">Other</option>
          </select>

          <label for="monthly-income">Monthly Income (USD)</label>
          <input id="monthly-income" name="number" type="number" min="0" step="1" formControlName="monthlyIncome" />

          <button type="submit">Apply Now</button>
        </form>
      </section>
  `,
  styleUrls: ['../home/home.css'],
})

export class LoanApplication {
  loanService = inject(LoanService);
  applyForm = new FormGroup({
    loanAmount: new FormControl(''),
    loanTerm: new FormControl(''),
    loanPurpose: new FormControl(''),
    employmentStatus: new FormControl(''),
    monthlyIncome: new FormControl(''),
  });

  submitApplication() {
    this.loanService.submitApplication(
      this.applyForm.value.loanAmount ?? '',
      this.applyForm.value.loanTerm ?? '',
      this.applyForm.value.loanPurpose ?? '',
      this.applyForm.value.employmentStatus ?? '',
      this.applyForm.value.monthlyIncome ?? ''
    );
  }
}