import {HttpErrorResponse} from '@angular/common/http';
import {Component, inject} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthService} from '../authservice/authservice';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  template: `
    <section>
      <h2>Customer sign in</h2>
      <form [formGroup]="loginForm" (ngSubmit)="login()">
        <label for="username">Username</label>
        <input id="username" type="text" formControlName="username"
          autocomplete="username" required>

        <label for="password">Password</label>
        <input id="password" type="password" formControlName="password"
          autocomplete="current-password" required>

        @if (loginError) {
          <p class="form-error" role="alert">{{ loginError }}</p>
        }

        <button type="submit" [disabled]="loggingIn">
          {{ loggingIn ? 'Signing in...' : 'Sign in to apply' }}
        </button>
      </form>
    </section>
  `,
  styleUrls: ['./login.css'],
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  loginForm = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
  });
  loggingIn = false;
  loginError = '';

  login() {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.invalid) {
      return;
    }

    const {username, password} = this.loginForm.getRawValue();
    if (!username || !password) {
      return;
    }

    this.loggingIn = true;
    this.loginError = '';
    this.authService.login(username, password).subscribe({
      next: (user) => {
        this.loggingIn = false;
        if (user.role !== 'CUSTOMER') {
          this.loginError = 'Sign in with a customer account to apply.';
          return;
        }
        void this.router.navigate(['/apply']);
      },
      error: (error: unknown) => {
        this.loggingIn = false;
        this.loginError = error instanceof HttpErrorResponse && error.status === 401
          ? 'Username or password is incorrect.'
          : 'Could not sign in. Check that the backend is running.';
      },
    });
  }
}
