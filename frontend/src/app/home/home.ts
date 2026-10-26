import { Component } from '@angular/core';
import { LoanApplication } from '../loanapply/loanapply';

@Component({
  selector: 'app-home',
  imports: [LoanApplication],
  template: `
    <app-loanapplication />
  `,
  styleUrls: ['./home.css'],
})
export class Home {}
