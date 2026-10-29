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
        <a class="secondary-button" routerLink="/customer/home">
          Back to applications
        </a>

        @if (loading){
            <p role="status">Loading application...</p>
        } @else if (errorMessage) {
            <p role="alert">Error loading application: {{errorMessage}}</p>
            <button type="button" class="secondary-button" (click)="loadApplication()">Retry</button>
        } @else if(application; as loan) {
         <header class="page-header">
            <div>
                <h1>Loan Application Details</h1>
                <p>Reference {{loan.reference}}</p>
                <p class="submitted-date">Submitted {{loan.submittedAt | date: 'medium'}}</p>
            </div>
            <span
                class="status"
                [class.status-approved]="loan.status === 'APPROVED'"
                [class.status-rejected]="loan.status === 'REJECTED'">
                {{loan.status}}
            </span>
         </header>

         <section class="application-details">
            <h2>Application details</h2>
            <dl class="details-grid">
                <div class="detail-item">
                    <dt>Applicant Name</dt>
                    <dd>{{loan.applicantName}}</dd>
                </div>
                <div class="detail-item">
                    <dt>Loan Amount</dt>
                    <dd>{{loan.loanAmount | currency}}</dd>
                </div>
                <div class="detail-item">
                    <dt>Term</dt>
                    <dd>{{loan.termMonths}} months</dd>
                </div>
                <div class="detail-item">
                    <dt>Purpose</dt>
                    <dd>{{loan.purpose}}</dd>
                </div>
                <div class="detail-item">
                    <dt>Employment Status</dt>
                    <dd>{{loan.employmentStatus}}</dd>
                </div>
                <div class="detail-item">
                    <dt>Monthly Income</dt>
                    <dd>{{loan.monthlyIncome | currency}}</dd>
                </div>
                @if (loan.decisionNote) {
                    <div class="detail-item">
                        <dt>Decision Note</dt>
                        <dd>{{loan.decisionNote}}</dd>
                    </div>
                }
                @if (loan.decidedAt) {
                    <div class="detail-item">
                        <dt>Decision Date</dt>
                        <dd>{{loan.decidedAt | date: 'medium'}}</dd>
                    </div>
                }
                @if (loan.decisionOfficerName) {
                    <div class="detail-item">
                        <dt>Decision Officer</dt>
                        <dd>{{loan.decisionOfficerName}}</dd>
                    </div>
                }
            </dl>
         </section>

            @if (loan.status === 'SUBMITTED'){
                <p class="pending-message" role="status">Your application is pending review.</p>
            }
        } @else {
            <section class="empty-state" role="status">
                <h2>Application details unavailable</h2>
                <p>No application details were returned. It may no longer be available.</p>
                <button type="button" class="secondary-button" (click)="loadApplication()">Try again</button>
            </section>
        }
     </section>
     `,

    styles: [`
        .customer-detail {
            max-width: 960px;
            margin: 0 auto;
            padding: 24px;
        }

        .secondary-button,
        .primary-button {
            display: inline-block;
            padding: 10px 14px;
            border: 1px solid var(--primary-color);
            border-radius: 8px;
            font: inherit;
            text-decoration: none;
        }

        .secondary-button {
            margin-bottom: 16px;
            background: white;
            color: var(--primary-color);
            cursor: pointer;
        }

        .page-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            margin-bottom: 24px;
        }

        .page-header p {
            margin-top: 8px;
            color: #555;
        }

        .submitted-date {
            font-size: 0.75rem;
        }

        .application-details,
        .empty-state {
            margin-bottom: 24px;
            padding: 24px;
            border: 1px solid var(--shadow-color);
            border-radius: 8px;
        }

        .details-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 20px;
            margin-top: 20px;
        }

        .detail-item dt {
            margin-bottom: 6px;
            color: #555;
            font-size: 0.9rem;
        }

        .detail-item dd {
            overflow-wrap: anywhere;
        }

        .pending-message {
            color: #555;
        }

        .empty-state p {
            margin: 12px 0;
        }

        .secondary-button:focus-visible,
        .primary-button:focus-visible {
            outline: 3px solid rgb(96 93 200 / 30%);
            outline-offset: 2px;
        }

        @media (max-width: 640px) {
            .customer-detail {
                padding: 16px;
            }

            .page-header {
                align-items: flex-start;
                flex-direction: column;
            }

            .application-details,
            .empty-state {
                padding: 18px;
            }

            .details-grid {
                grid-template-columns: 1fr;
                gap: 16px;
            }
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
