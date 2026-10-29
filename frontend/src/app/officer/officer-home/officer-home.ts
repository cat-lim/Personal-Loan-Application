import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { OfficerService } from '../services/officer.service';
import type { OfficerApplication } from '../models/officer-application.model';

@Component({
  selector: 'app-officer-queue',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './officer-home.html',
  styleUrls: ['./officer-home.css']
})
export class OfficerQueueComponent implements OnInit {
  timestamp = Date.now();
  randomId = Math.floor(Math.random() * 100000);

  applications: OfficerApplication[] = [];

  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private officerService: OfficerService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {console.log('QUEUE CONSTRUCTOR');}


  ngOnInit(): void {
    console.log('QUEUE INIT');

    const state = history.state;

    if (state?.successMessage) {
      this.successMessage = state.successMessage;
    }

    this.loadQueue();
  }

  loadQueue(): void {
    this.loading = true;
    this.errorMessage = '';

    this.officerService
      .getPendingQueue()
      .subscribe({
        next: (response) => {
          this.applications = response;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error(error);
          this.errorMessage = 'Unable to load pending applications. Please try again.';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }
}