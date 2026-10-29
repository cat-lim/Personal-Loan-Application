import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <section class="home-page">
      <div class="welcome">
        <p class="eyebrow">Northstar Personal Loans</p>
        <h1>Personal loans, made simpler.</h1>
        <p class="intro">
          Apply for a personal loan and keep track of your application, or help
          customers by reviewing and managing applications in one place.
        </p>
      </div>

      <div class="sign-in-options">
        <h2>How would you like to sign in?</h2>
        <div class="option-grid">
          <article class="option-card">
            <div>
              <h3>I'm a customer</h3>
              <p>Apply for a personal loan and check the status of your applications.</p>
            </div>
            <a class="sign-in-link" routerLink="/login">Customer sign in</a>
          </article>

          <article class="option-card">
            <div>
              <h3>I'm a loan officer</h3>
              <p>Review submitted applications and manage them through the decision process.</p>
            </div>
            <a class="sign-in-link secondary-link" routerLink="/officer-login">
              Officer sign in
            </a>
          </article>
        </div>
      </div>
    </section>
  `,
  styleUrls: ['./home.css'],
})
export class Home {}
