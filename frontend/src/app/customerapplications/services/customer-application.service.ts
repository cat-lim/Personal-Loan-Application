import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  ApplicationSummary,
  ApplicationDetail
} from '../models/application.model';

import { Decision } from '../models/decision.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerApplicationService {

  private readonly baseUrl = '/customer/api/applications';

  constructor(private http: HttpClient) {}

  getApplications(): Observable<ApplicationSummary[]> {
    return this.http.get<ApplicationSummary[]>(this.baseUrl);
  }

  getApplication(
    applicationId: string
  ): Observable<ApplicationDetail> {
    return this.http.get<ApplicationDetail>(
      `${this.baseUrl}/${applicationId}`
    );
  }

  getDecision(
    applicationId: string
  ): Observable<Decision> {
    return this.http.get<Decision>(
      `${this.baseUrl}/${applicationId}/decision`
    );
  }
}