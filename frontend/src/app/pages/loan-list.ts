import { LoanApplication } from '../models/loan.model';
import {Component, OnInit, inject} from '@angular/core';
import { LoanService } from '../loanservice/loanservice';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loan-list',
  templateUrl: './loan-list.html',
  standalone: true,
  imports: [CommonModule]
})
export class LoanList implements OnInit {

  private loanService = inject(LoanService);
  loans: LoanApplication[] = [];
  loading = false;
  error = '';

  ngOnInit() : void {
    this.loading = true;
    this.error = '';}

    loadLoans() : void{
        this.loading = true;
        this.error = '';

        this.loanService.getMyLoans().subscribe({
           next: (data: LoanApplication[] ) => {
             this.loans = data;
             this.loading = false;
             console.log('Loans from API: ', data);
        },
        error: (err: Error) => {
          this.error = err.message;
          this.loading = false;
          console.error('Error fetching loans: ', err);
      }
    });
  }
}