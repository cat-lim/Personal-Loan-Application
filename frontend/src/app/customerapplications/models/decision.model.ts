export interface Decision {
  decisionId: string;
  decisionDate: string;
  outcome: 'APPROVED' | 'DECLINED' | 'REFERRED';
  reasonCodes: string[];
}