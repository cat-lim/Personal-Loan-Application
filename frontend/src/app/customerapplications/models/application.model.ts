import { Decision } from './decision.model';

export interface ApplicationSummary {
  applicationId: string;
  referenceNumber: string;
  amount: number;
  termMonths: number;
  submittedDate: string;
  status: string;
}

export interface ApplicationDetail {
  applicationId: string;
  referenceNumber: string;
  applicantName: string;
  submittedDate: string;
  amount: number;
  termMonths: number;
  status: string;
  decision?: Decision;
}
