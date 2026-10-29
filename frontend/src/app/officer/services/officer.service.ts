import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { OfficerApplication } from '../models/officer-application.model';

@Injectable({
  providedIn: 'root'
})
export class OfficerService {

  private apiUrl = 'http://localhost:8081/api/officer/applications';

  constructor(
    private http: HttpClient
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

  return this.http.post(
    `${this.apiUrl}/${id}/decision`,
    {
      decision: 'APPROVED',
      reason
    },
    {
      withCredentials: true
    }
  );
}

rejectApplication(
  id: number,
  reason: string
) {

  return this.http.post(
    `${this.apiUrl}/${id}/decision`,
    {
      decision: 'REJECTED',
      reason
    },
    {
      withCredentials: true
    }
  );
}

  removeApplication(id: number): void {
    // Mock implementation only.
  }
}