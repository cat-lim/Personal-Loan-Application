export interface LoanApplication {
  id: number;
  customerName: string;

  amount: number;
  term: number;
  purpose: string;

  employmentStatus: string;
  monthlyIncome: number;

  status: string;
  submittedAt: string;
}