import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <section>
      <h1>Northstar Personal Loans</h1>
      <p>Sign in to submit a personal loan application.</p>
      <a routerLink="/login">Customer login</a><br>
      <a routerLink="/officer-login">Officer login</a>
    </section>
  `,
  styleUrls: ['./home.css'],
})
export class Home {}
