import {HttpClient} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';

export interface CustomerApplication {
  id: number;
  reference: string;
  applicantName: string;
  loanAmount: number;
  termMonths: number;
  purpose: string;
  employmentStatus: 'EMPLOYED' | 'SELF_EMPLOYED' | 'RETIRED' | 'OTHER';
  monthlyIncome: number;
  status: 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  decisionNote: string | null;
  decidedAt: string | null;
  decisionOfficerName: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/applications';

  getApplications(): Observable<CustomerApplication[]> {
    return this.http.get<CustomerApplication[]>(this.apiUrl, {
      withCredentials: true,
    });
  }

  getApplication(id: number): Observable<CustomerApplication> {
    return this.http.get<CustomerApplication>(`${this.apiUrl}/${id}`, {
      withCredentials: true,
    });
  }
}
