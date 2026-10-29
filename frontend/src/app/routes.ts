import {inject} from '@angular/core';
import {CanActivateFn, Router, Routes} from '@angular/router';
import {catchError, map, of} from 'rxjs';
import {Home} from './home/home';
import {Login} from './login/login';
import {LoanApplication} from './loanapply/loanapply';
import {AuthService} from './authservice/authservice';
import {OfficerQueueComponent} from './officer/officer-home/officer-home';
import {OfficerReviewComponent} from './officer/officer-review/officer-review';
import {OfficerLogin} from './officer/officer-login/officer-login';
import {CustomerHome} from './customer/customer-home';
import {CustomerDetailComponent} from './customer/customer-detail';
import {OfficerAuthGuard} from './guards/officer-auth.guard';
import {Unauthorized} from './pages/unauthorized';

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
    path: 'officer-login',
    component: OfficerLogin,
    title: 'Officer login',
  },
  {
    path: 'customer/home',
    component: CustomerHome,
    canActivate: [customerAuthGuard],
    title: 'My loan applications',
  },
  {
    path: 'apply',
    component: LoanApplication,
    canActivate: [customerAuthGuard],
    title: 'Loan application',
  },
  {
    path: 'officer/queue',
    component: OfficerQueueComponent,
    canActivate: [OfficerAuthGuard],
    title: 'Officer application queue',
  },
  {
    path: 'officer/applications/:id',
    component: OfficerReviewComponent,
    canActivate: [OfficerAuthGuard],
    title: 'Review loan application',
  },
  {
    path: 'officer',
    component: OfficerQueueComponent,
    canActivate: [OfficerAuthGuard],
    title: 'Officer Dashboard',
  },
  {
    path: 'customer/applications/:id',
    component: CustomerDetailComponent,
    canActivate: [customerAuthGuard],
    title: 'Customer application details',
  },
  {
    path: 'unauthorized',
    component: Unauthorized,
    title: 'Unauthorized',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
export default routeConfig;
