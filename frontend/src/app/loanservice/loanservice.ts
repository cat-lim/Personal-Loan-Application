import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class LoanService {
    submitApplication(firstName: string, lastName: string, email: string) {
        console.log(
        `Homes application received: firstName: ${firstName}, lastName: ${lastName}, email: ${email}.`,
        );
    }
}