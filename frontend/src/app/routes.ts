import {inject} from '@angular/core';
import {CanActivateFn, Router, Routes} from '@angular/router';
import {catchError, map, of} from 'rxjs';
import {Home} from './home/home';
import {Login} from './login/login';
import {LoanApplication} from './loanapply/loanapply';
import {AuthService} from './authservice/authservice';
import {CustomerHome} from './customer/customer-home';
import { CustomerDetailComponent } from './customer/customer-detail';
import {OfficerAuthGuard} from './guards/officer-auth.guard';
import {Unauthorized} from './pages/unauthorized';
import {OfficerQueueComponent} from './officer/officer-home;

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
    path: 'customer/applications/:id',
    component: CustomerDetailComponent,
    canActivate: [customerAuthGuard],
    title: 'Customer application details',
  },
  {
    path: '**',
    redirectTo: '',
  },
<<<<<<< HEAD

   {
      path: 'customer/applications/:id',
      component: CustomerDetailComponent,
      canActivate: [customerAuthGuard],
      title: 'Customer Application Details'
    },
    {
      path: 'unauthorized',
      component: Unauthorized,
      title: 'Unauthorized'
    },

    {
      path: 'officer',
      component: OfficerQueueComponent,
      canActivate: [OfficerAuthGuard],
      title: 'Officer Dashboard'
    }
=======
>>>>>>> ee6e1ce53bb1049a7ece5d04fc9d1282b86c329c
];
export default routeConfig;