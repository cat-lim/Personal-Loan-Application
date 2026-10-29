import {inject} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, GuardResult, MaybeAsync, Router, RouterStateSnapshot} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {catchError, map, of} from 'rxjs';

export class OfficerAuthGuard implements CanActivate {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): MaybeAsync<GuardResult> {
    return this.http.get<{ role: string }>(
      '/api/auth/officer',
      { withCredentials: true }
    ).pipe(
      map(user => user.role === 'OFFICER'
        ? true
        : this.router.createUrlTree(['/unauthorized'])
      ),
      catchError(() => of(this.router.createUrlTree(['/unauthorized'])))
    );
    }
};
