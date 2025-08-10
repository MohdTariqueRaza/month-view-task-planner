export interface Task {
  id: string;
  title: string;
  category: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  description?: string;
  [key: string]: unknown;
}
