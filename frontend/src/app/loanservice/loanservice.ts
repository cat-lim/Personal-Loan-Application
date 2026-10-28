import {HttpClient, HttpHeaders} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {Observable, switchMap, timeout} from 'rxjs';
import {AuthService} from '../authservice/authservice';

export type EmploymentStatus = 'EMPLOYED' | 'SELF_EMPLOYED' | 'RETIRED' | 'OTHER';

export interface LoanSubmissionRequest {
  amount: number;
  termMonths: number;
  purpose: string;
  employmentStatus: EmploymentStatus;
  monthlyIncome: number;
}

export interface LoanSubmissionResponse {
  reference: string;
  status: string;
  submittedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class LoanService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = 'http://localhost:8080/api/loans';

  submitApplication(request: LoanSubmissionRequest): Observable<LoanSubmissionResponse> {
    return this.authService.getCsrfToken().pipe(
      switchMap(({token, headerName}) =>
        this.http.post<LoanSubmissionResponse>(
          `${this.apiUrl}/submit`,
          request,
          {
            headers: new HttpHeaders()
              .set(headerName, token)
              .set('Idempotency-key', crypto.randomUUID()),
            withCredentials: true,
          },
        ),
      ),
      timeout(20_000),
    );
  }
}
