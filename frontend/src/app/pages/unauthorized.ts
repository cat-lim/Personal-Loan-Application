import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink],
  template: `
      <div class="unauthorized-container">
      <h1>Unauthorized</h1>
      <p>You do not have permission to access this page.</p>
      <a routerLink="/">Go to Home</a>
    </div>
  `
})
export class Unauthorized {
}