import {Component, inject} from '@angular/core';
import {LoanService} from '../loanservice/loanservice';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-loanapplication',
  imports: [ReactiveFormsModule],
  template: `
      <section class="listing-apply">
        <h2 class="section-heading">Apply to live here</h2>
        <form [formGroup]="applyForm" (ngSubmit)="submitApplication()">
          <label for="first-name">First Name</label>
          <input id="first-name" type="text" formControlName="firstName" />
          
          <label for="last-name">Last Name</label>
          <input id="last-name" type="text" formControlName="lastName" />
          
          <label for="email">Email</label>
          <input id="email" type="email" formControlName="email" />
          <button type="submit">Apply Now</button>
        </form>
      </section>
  `,
  styleUrls: ['../home/home.css'],
})

export class LoanApplication {
  loanService = inject(LoanService);
  applyForm = new FormGroup({
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    email: new FormControl(''),
  });

  submitApplication() {
    this.loanService.submitApplication(
      this.applyForm.value.firstName ?? '',
      this.applyForm.value.lastName ?? '',
      this.applyForm.value.email ?? ''
    );
  }
}