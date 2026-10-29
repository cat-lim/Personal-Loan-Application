import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {catchError, map, of} from 'rxjs';
import {AuthService} from '../authservice/authservice';

export const officerAuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.getCurrentUser().pipe(
    map((user) => user.role === 'OFFICER' || router.createUrlTree(['/unauthorized'])),
    catchError(() => of(router.createUrlTree(['/unauthorized']))),
  );
};
