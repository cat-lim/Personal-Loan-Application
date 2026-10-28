export interface OfficerApplication {
  id: number;
  reference: string;

  applicantName: string;
  applicantUsername: string;

  loanAmount: number;
  termMonths: number;

  purpose: string;

  employmentStatus: string;
  monthlyIncome: number;

  status: string;

  submittedAt: string;

  decisionNote: string | null;
  decidedAt: string | null;
  decisionOfficerName: string | null;
}