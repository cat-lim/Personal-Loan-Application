import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable, inject} from '@angular/core';
import {Observable, switchMap} from 'rxjs';

export interface AuthResponse {
  userId: number;
  username: string;
  role: 'CUSTOMER' | 'OFFICER';
}

export interface CsrfTokenResponse {
  token: string;
  headerName: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/auth';

  getCurrentUser(): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${this.apiUrl}/me`, {
      withCredentials: true,
    });
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.getCsrfToken().pipe(
      switchMap(({token, headerName}) =>
        this.http.post<AuthResponse>(
          `${this.apiUrl}/login`,
          {username, password},
          {
            headers: new HttpHeaders().set(headerName, token),
            withCredentials: true,
          },
        ),
      ),
    );
  }

  logout(): Observable<void> {
    return this.getCsrfToken().pipe(
      switchMap(({token, headerName}) =>
        this.http.post<void>(
          `${this.apiUrl}/logout`,
          {},
          {
            headers: new HttpHeaders().set(headerName, token),
            withCredentials: true,
          },
        ),
      ),
    );
  }

  getCsrfToken(): Observable<CsrfTokenResponse> {
    return this.http.get<CsrfTokenResponse>(`${this.apiUrl}/csrf`, {
      withCredentials: true,
    });
  }
}
