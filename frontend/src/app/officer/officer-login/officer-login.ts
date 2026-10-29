import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../authservice/authservice';

@Component({
  selector: 'app-officer-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="login-card" aria-labelledby="login-title">
      <p class="eyebrow">Northstar Personal Loans</p>
      <h1 id="login-title">Officer sign in</h1>
      <p class="intro">Sign in to review and manage loan applications.</p>

      <form
        [formGroup]="loginForm"
        (ngSubmit)="login()">
        <div class="form-field">
          <label for="username">Username</label>
          <input
            id="username"
            type="text"
            formControlName="username"
            autocomplete="username"
            placeholder="Enter your username"
            required>
        </div>

        <div class="form-field">
          <label for="password">Password</label>
          <input
            id="password"
            type="password"
            formControlName="password"
            autocomplete="current-password"
            placeholder="Enter your password"
            required>
        </div>

        @if (loginError) {
          <p class="form-error" role="alert">{{ loginError }}</p>
        }

        <button type="submit" [disabled]="loggingIn">
          {{ loggingIn ? 'Signing in...' : 'Sign in' }}
        </button>
      </form>

      <a class="back-link" routerLink="/">Back to home</a>
    </section>
  `,
  styleUrls: ['../../login/login.css']
})
export class OfficerLogin {

  private readonly authService =
    inject(AuthService);

  private readonly router =
    inject(Router);

  loginForm = new FormGroup({
    username: new FormControl(
      '',
      Validators.required
    ),
    password: new FormControl(
      '',
      Validators.required
    ),
  });

  loggingIn = false;
  loginError = '';

  login(): void {

    this.loginForm.markAllAsTouched();

    if (this.loginForm.invalid) {
      return;
    }

    const {
      username,
      password
    } = this.loginForm.getRawValue();

    if (!username || !password) {
      return;
    }

    this.loggingIn = true;
    this.loginError = '';

    this.authService
      .login(username, password)
      .subscribe({
        next: (user) => {

          this.loggingIn = false;

          if (user.role !== 'OFFICER') {

            this.loginError =
              'Sign in with an officer account.';

            return;
          }

          void this.router.navigate([
            '/officer/queue'
          ]);
        },

        error: (
          error: unknown
        ) => {

          this.loggingIn = false;

          this.loginError =
            error instanceof HttpErrorResponse &&
            error.status === 401
              ? 'Username or password is incorrect.'
              : 'Could not sign in. Check that the backend is running.';
        }
      });
  }
}