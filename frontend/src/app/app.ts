import {Component} from '@angular/core';
import {RouterOutlet, RouterLink} from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  template: ` 
    <main>
      <a [routerLink]="'/'">Home</a>
      <header class="brand-name">
        <img class="brand-logo" src="/public/logo.svg" alt="logo" aria-hidden="true" />
      </header>
      <section class="content">
        <router-outlet />
      </section>
    </main>
  `,
                
  styleUrls: ['./app.css'],
})
export class App {
  title = 'Northstar Bank';
}

