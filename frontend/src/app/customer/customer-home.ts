import {Component, OnInit, inject} from '@angular/core';
import {CurrencyPipe, DatePipe} from '@angular/common';
import {RouterLink} from '@angular/router';
import {CustomerApplication, CustomerService} from './customer.service';

@Component({
  selector: 'app-customer-home',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  template: `
    <section class="customer-home">
      <header class="page-header">
        <div>
          <h1>My Loan Applications</h1>
          <p>Review your applications and check their current status.</p>
        </div>
        <a class="primary-button" routerLink="/apply">Apply for a loan</a>
      </header>

      @if (loading) {
        <p role="status">Loading your applications...</p>
      } @else if (errorMessage) {
        <p class="error-message" role="alert">{{ errorMessage }}</p>
        <button type="button" class="secondary-button" (click)="loadApplications()">Try again</button>
      } @else if (applications.length === 0) {
        <section class="empty-state">
          <h2>No applications yet</h2>
          <p>When you submit a loan application, it will appear here.</p>
          <a class="primary-button" routerLink="/apply">Start an application</a>
        </section>
      } @else {
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th scope="col">Reference</th>
                <th scope="col">Amount</th>
                <th scope="col">Term</th>
                <th scope="col">Purpose</th>
                <th scope="col">Status</th>
                <th scope="col">Submitted</th>
                <th scope="col">Decision note</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (application of applications; track application.id) {
                <tr>
                  <td>{{ application.reference }}</td>
                  <td>{{ application.loanAmount | currency }}</td>
                  <td>{{ application.termMonths }} months</td>
                  <td>{{ application.purpose }}</td>
                  <td><span class="status">{{ application.status }}</span></td>
                  <td>{{ application.submittedAt | date:'short' }}</td>
                  <td>{{ application.decisionNote || '—' }}</td>
                  <td>
                    <a [routerLink]= "['/customer/applications', application.id]">View details</a> </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>
  `,
  styleUrls: ['./customer-home.css'],
})
export class CustomerHome implements OnInit {
  private readonly customerService = inject(CustomerService);

  applications: CustomerApplication[] = [];
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.loading = true;
    this.errorMessage = '';

    this.customerService.getApplications().subscribe({
      next: (applications) => {
        this.applications = applications;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load your applications. Please try again.';
        this.loading = false;
      },
    });
  }
}
