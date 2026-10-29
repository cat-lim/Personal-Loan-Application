import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="unauthorized-page">
      <div class="unauthorized-card">
        <div class="status-badge">403</div>
        <h1>Unauthorized</h1>
        <p>You do not have permission to access this page. Please sign in with the correct account or return home.</p>
        <a routerLink="/" class="home-link">Go to Home</a>
      </div>
    </div>
  `,
  styles: [`
    :host {
      box-sizing: border-box;
      display: grid;
      min-height: calc(100vh - 100px);
      margin: -10px;
      padding: 40px 20px;
      place-items: center;
      background: linear-gradient(180deg, #f5f6fa 0%, #eef2ff 100%);
      color: #20243a;
      font-family: inherit;
    }

    .unauthorized-page {
      width: min(100%, 520px);
    }

    .unauthorized-card {
      box-sizing: border-box;
      width: 100%;
      padding: 40px 32px;
      border: 1px solid #e4e7f1;
      border-radius: 20px;
      background: #fff;
      text-align: center;
      box-shadow: 0 18px 44px rgb(34 42 74 / 12%);
    }

    .status-badge {
      display: inline-flex;
      min-width: 72px;
      height: 72px;
      align-items: center;
      justify-content: center;
      margin-bottom: 18px;
      border-radius: 50%;
      background: #f3f0ff;
      color: var(--primary-color, #605dc8);
      font-size: 26px;
      font-weight: 800;
      letter-spacing: 0.08em;
    }

    h1 {
      margin: 0 0 12px;
      font-size: clamp(2rem, 4vw, 2.8rem);
      line-height: 1.1;
    }

    p {
      margin: 0 auto 28px;
      max-width: 38ch;
      color: #646a7d;
      font-size: 1rem;
      line-height: 1.6;
    }

    .home-link {
      display: inline-flex;
      min-height: 48px;
      align-items: center;
      justify-content: center;
      padding: 0 22px;
      border: 0;
      border-radius: 10px;
      background: var(--primary-color, #605dc8);
      color: #fff;
      font-size: 15px;
      font-weight: 700;
      text-decoration: none;
      transition: transform 150ms ease, background-color 150ms ease, box-shadow 150ms ease;
    }

    .home-link:hover {
      background: #4d4ab0;
      box-shadow: 0 10px 24px rgb(96 93 200 / 22%);
      transform: translateY(-1px);
    }

    .home-link:focus-visible {
      outline: 3px solid rgb(96 93 200 / 25%);
      outline-offset: 3px;
    }

    @media (max-width: 480px) {
      .unauthorized-card {
        padding: 32px 22px;
      }

      .status-badge {
        width: 62px;
        height: 62px;
        font-size: 22px;
      }
    }
  `]
})
export class Unauthorized {
}