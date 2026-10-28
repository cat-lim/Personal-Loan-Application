import {inject} from '@angular/core';
import {CanActivateFn, Router, Routes} from '@angular/router';
import {catchError, map, of} from 'rxjs';
import {Home} from './home/home';
import {Login} from './login/login';
import {LoanApplication} from './loanapply/loanapply';
import {AuthService} from './authservice/authservice';

const customerAuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.getCurrentUser().pipe(
    map((user) => user.role === 'CUSTOMER' || router.createUrlTree(['/login'])),
    catchError(() => of(router.createUrlTree(['/login']))),
  );
};

const routeConfig: Routes = [
  {
    path: '',
    component: Home,
    title: 'Home page',
  },
  {
    path: 'login',
    component: Login,
    title: 'Customer login',
  },
  {
    path: 'apply',
    component: LoanApplication,
    canActivate: [customerAuthGuard],
    title: 'Loan application',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
export default routeConfig;