import {Component} from '@angular/core';
import {RouterOutlet, RouterLink} from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  template: ` 
    <main>
      <header class="site-header">
        <span class="brand-name">Northstar</span>
        <nav aria-label="Main navigation">
          <a class="home-link" routerLink="/">Home</a>
        </nav>
      </header>

      <section class="content">
        <router-outlet />
      </section>
    </main>
  `,
  styleUrls: ['./app.css']
})
export class App {}