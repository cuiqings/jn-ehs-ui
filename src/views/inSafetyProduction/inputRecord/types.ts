export interface InputRecordItem {
  year: string;
  amount: string;
  status: 'completed' | 'pending' | 'processing';
  title: string;
}

export interface InputRecordQuery {
  year?: string;
}