import { Component } from '@angular/core';
import { LoanApplication } from '../loanapply/loanapply';

@Component({
  selector: 'app-home',
  imports: [LoanApplication],
  template: `
    <section>
      <form>
        <input type="text" placeholder="Filter by city" />
        <button class="primary" type="button">Search</button>
      </form>
    </section>
    <app-loanapplication />
  `,
  styleUrls: ['./home.css'],
})
export class Home {}
