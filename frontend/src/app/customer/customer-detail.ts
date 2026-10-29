import {ChangeDetectorRef, Component, OnInit, inject} from '@angular/core';
import {CurrencyPipe, DatePipe} from '@angular/common';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {HttpErrorResponse} from '@angular/common/http';

import{
    CustomerApplication,
    CustomerService
} from './customer.service';

@Component({
    selector: 'app-customer-detail',
    standalone: true,
    imports: [CurrencyPipe, DatePipe, RouterLink],
    template:`
      <section class="customer-detail">
        <a routerLink='/customer/home'>
          Back to applications
        </a>

        <h1> Loan Application Details </h1>

        @if (loading){
            <p role="status">Loading application...</p>
        } @else if (errorMessage) {
            <p role="alert">Error loading application: {{errorMessage}}</p>
            <button (click)="loadApplication()">Retry</button>
        } @else if(application; as loan) {
         <div class="details-card">
            <p><strong>Reference:</strong> {{loan.reference}}</p>
            <p><strong>Applicant:</strong> {{loan.applicantName}}</p>
            <p><strong>Loan Amount:</strong> {{loan.loanAmount | currency}}</p>
            <p><strong>Loan Term:</strong> {{loan.termMonths}} months</p>
            <p><strong>Purpose:</strong> {{loan.purpose}}</p>

            <p><strong>Employment:</strong> {{loan.employmentStatus}}</p>
            <p><strong>Monthly Income:</strong> {{loan.monthlyIncome | currency}}</p>
            <p><strong>Status:</strong> {{loan.status}}</p>
            <p><strong>Submitted:</strong> {{loan.submittedAt | date: 'medium'}}</p>

            @if (loan.decisionNote){
                <p><strong>Decision Note:</strong> {{loan.decisionNote}}</p>
            }
            
            @if (loan.decidedAt){
                <p><strong>Decided At:</strong> {{loan.decidedAt | date: 'medium'}}</p>
            }

            @if (loan.decisionOfficerName){
                <p><strong>Decision officer:</strong> {{loan.decisionOfficerName}}</p>
            }
            
            @if (loan.status === 'SUBMITTED'){
                <p>Your application is pending review.</p>
            }

        </div>
        } @else {
            <section class="empty-state" role="status">
                <h2>Application details unavailable</h2>
                <p>No application details were returned. It may no longer be available.</p>
                <button type="button" (click)="loadApplication()">Try again</button>
            </section>
        }
     </section>
     `,

    styles: [`
        .customer-detail {
            max-width: 760px;
            margin: 30px auto;
            padding: 20px;
        }

        .details-card {
            padding: 24px;
            border: 1px solid #ccc;
            border-radius: 12px;
           
        }

        .details-card p{
            margin: 14px 0;
        }

        .empty-state {
            margin-top: 20px;
            padding: 24px;
            border: 1px solid #ccc;
            border-radius: 12px;
        }

        .empty-state p {
            margin: 12px 0;
        }

        button{
            padding: 10px 16px;
            cursor: pointer;
        }
    `]
})
export class CustomerDetailComponent implements OnInit {
    
    private route = inject(ActivatedRoute);
    private customerService = inject(CustomerService);
    private readonly changeDetector = inject(ChangeDetectorRef);

    application: CustomerApplication | null = null;
    loading = false;
    errorMessage = '';


    ngOnInit(): void {
        this.loadApplication();
    }

    loadApplication(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        if (!Number.isInteger(id) || id <= 0) {
            this.errorMessage = 'Invalid Application ID';
            this.application = null;
            this.loading = false;
            return;
        }

        this.application = null;
        this.loading = true; 
        this.errorMessage = '';

        this.customerService.getApplication(id).subscribe({
            next: (application) => {
                this.loading = false;
                if (!application) {
                    this.errorMessage = 'No application details were returned. It may no longer be available.';
                    this.changeDetector.markForCheck();
                    return;
                }

                this.application = application;
                this.changeDetector.markForCheck();
            },
            error: (error: HttpErrorResponse) => {
                this.loading = false;
                this.application = null;

                if (error.status === 404) {
                    this.errorMessage = 'Application not found';
                } else if (error.status === 403) {
                    this.errorMessage = 'You do not have permission to view this application';
                } else if (error.status === 401) {
                    this.errorMessage = 'You are not authenticated';
                } else {
                    this.errorMessage = 'Unable to load details. Please try again.';
                }
                this.changeDetector.markForCheck();
            },
        });
    }
}
