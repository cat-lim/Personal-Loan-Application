import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import {
  ApplicationDetail
} from '../models/application.model';

import { Decision } from '../models/decision.model';

import { CustomerApplicationService }
from '../services/customer-application.service';

@Component({
  selector: 'app-application-detail',
  templateUrl: './application-detail.component.html',
  styleUrls: ['./application-detail.component.scss']
})
export class ApplicationDetailComponent implements OnInit {

  application?: ApplicationDetail;
  decision?: Decision;

  loading = false;

  constructor(
    private route: ActivatedRoute,
    private applicationService: CustomerApplicationService
  ) {}

  ngOnInit(): void {
    const id =
      this.route.snapshot.paramMap.get('id');

    if (id) {
      this.loadApplication(id);
      this.loadDecision(id);
    }
  }

  private loadApplication(id: string): void {
    this.loading = true;

    this.applicationService
      .getApplication(id)
      .subscribe({
        next: (response) => {
          this.application = response;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  private loadDecision(id: string): void {
    this.applicationService
      .getDecision(id)
      .subscribe({
        next: (response) => {
          this.decision = response;
        }
      });
  }
}