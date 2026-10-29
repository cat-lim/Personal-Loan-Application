import {inject} from '@angular/core';
import {CanActivateFn, Router, Routes} from '@angular/router';
import {catchError, map, of} from 'rxjs';
import {Home} from './home/home';
import {Login} from './login/login';
import {LoanApplication} from './loanapply/loanapply';
import {AuthService} from './authservice/authservice';
import {CustomerHome} from './customer/customer-home';
import { CustomerDetailComponent } from './customer/customer-detail';

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
    path: '**',
    redirectTo: '',
  },

   {
      path: 'customer/applications/:id',
      component: CustomerDetailComponent,
      canActivate: [customerAuthGuard],
      title: 'Customer Application Details'
    }
];
export default routeConfig;