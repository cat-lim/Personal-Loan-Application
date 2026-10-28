import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

import { OfficerApplication } from '../models/officer-application.model';

@Injectable({
  providedIn: 'root'
})
export class OfficerService {

    private apiUrl = '/api/officer';

    constructor(private http: HttpClient) {}

    // mock data
    private mockApplications: OfficerApplication[] = [
        {
            id: 1,
            reference: 'LN-1001',
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
            reference: 'LN-1002',
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

    // getPendingQueue() {
    //     return this.http.get<OfficerApplication[]>(
    //         '/api/officer/applications'
    //     );
    // }

    getPendingQueue() {
        return of(this.mockApplications);
    }

    getApplication(id: number) {
        return this.http.get<OfficerApplication>(
            `/api/officer/applications/${id}`
        );
    }

    approveApplication(applicationId: number, reason: string) {
        return this.http.post(
            `/api/officer/applications/${applicationId}/decision`,
        { 
            decision: 'APPROVED', 
            reason 
        });
    }

    rejectApplication(applicationId: number, reason: string) {
        return this.http.post(
        `/api/officer/applications/${applicationId}/decision`,
        {
        decision: 'REJECTED',
        reason
        });
    }

    removeApplication(id: number): void {
        this.mockApplications =
            this.mockApplications.filter(app => app.id !== id);
    }
}