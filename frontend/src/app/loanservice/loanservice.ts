import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class LoanService {
    submitApplication(loanAmount: string, loanTerm: string, loanPurpose: string, employmentStatus: string, monthlyIncome: string) {
        console.log(
        `Loan application received: loanAmount: ${loanAmount}, loanTerm: ${loanTerm}, loanPurpose: ${loanPurpose}, employmentStatus: ${employmentStatus}, monthlyIncome: ${monthlyIncome}.`,
        );
    }
}