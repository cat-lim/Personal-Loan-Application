import {Component, DestroyRef, inject} from '@angular/core';
import {NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {AuthService} from './authservice/authservice';
import {filter} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: ` 
    <main>
      <header class="site-header">
        <a class="brand-name" [routerLink]="homeRoute" aria-label="Northstar home">Northstar</a>
        <nav aria-label="Main navigation">
          @if (showCustomerNavigation) {
            <a class="header-link" routerLink="/customer/home" routerLinkActive="active"
              [routerLinkActiveOptions]="{exact: true}">My applications</a>
            <a class="header-link" routerLink="/apply" routerLinkActive="active">Apply for a loan</a>
          }
          @if (showSignOut) {
            <button class="sign-out-button" type="button" [disabled]="signingOut" (click)="signOut()">
              {{ signingOut ? 'Signing out...' : 'Sign out' }}
            </button>
          }
        </nav>
      </header>

      @if (signOutError) {
        <p class="sign-out-error" role="alert">{{ signOutError }}</p>
      }

      <section class="content">
        <router-outlet />
      </section>
    </main>
  `,
  styleUrls: ['./app.css']
})
export class App {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  currentUrl = this.router.url;
  signingOut = false;
  signOutError = '';

  constructor() {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((event) => {
      this.currentUrl = event.urlAfterRedirects.split('?')[0];
      this.signOutError = '';
    });
  }

  get homeRoute(): string {
    if (this.currentUrl.startsWith('/officer/')) {
      return '/officer/queue';
    }
    if (this.currentUrl === '/apply' || this.currentUrl.startsWith('/customer/')) {
      return '/customer/home';
    }
    return '/';
  }

  get showSignOut(): boolean {
    return this.currentUrl === '/apply' ||
      this.currentUrl.startsWith('/customer/') ||
      this.currentUrl.startsWith('/officer/');
  }

  get showCustomerNavigation(): boolean {
    return this.currentUrl === '/customer/home' ||
      this.currentUrl === '/apply' ||
      this.currentUrl.startsWith('/customer/applications/');
  }

  signOut(): void {
    if (this.signingOut) {
      return;
    }

    this.signingOut = true;
    this.signOutError = '';
    this.authService.logout().pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: () => {
        this.signingOut = false;
        void this.router.navigate(['/']);
      },
      error: () => {
        this.signingOut = false;
        this.signOutError = 'Could not sign out. Please try again.';
      },
    });
  }
}