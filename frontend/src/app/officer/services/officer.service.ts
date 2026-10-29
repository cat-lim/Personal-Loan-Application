import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';

import { OfficerApplication } from '../models/officer-application.model';
import { AuthService } from '../../authservice/authservice';

@Injectable({
  providedIn: 'root'
})
export class OfficerService {

  private apiUrl = 'http://localhost:8081/api/officer/applications';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getPendingQueue(): Observable<OfficerApplication[]> {
  return this.http.get<OfficerApplication[]>(
    this.apiUrl,
    {
      withCredentials: true
    }
  );
}


  getApplication(
  id: number
): Observable<OfficerApplication> {

  return this.http.get<OfficerApplication>(
    `${this.apiUrl}/${id}`,
    {
      withCredentials: true
    }
  );
}


 approveApplication(
  id: number,
  reason: string
) {

  return this.submitDecision(id, 'APPROVED', reason);
}

rejectApplication(
  id: number,
  reason: string
) {

  return this.submitDecision(id, 'REJECTED', reason);
}

private submitDecision(
  id: number,
  decision: 'APPROVED' | 'REJECTED',
  reason: string
) {
  return this.authService.getCsrfToken().pipe(
    switchMap(({ token, headerName }) =>
      this.http.post(
        `${this.apiUrl}/${id}/decision`,
        { decision, reason },
        {
          headers: new HttpHeaders().set(headerName, token),
          withCredentials: true
        }
      )
    )
  );
}

  removeApplication(id: number): void {
    // Mock implementation only.
  }
}