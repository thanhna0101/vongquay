export interface WheelSegment {
  id: string;
  text: string;
  color: string;
}

export interface GeneratedListResponse {
  items: string[];
}

export enum FileType {
  EXCEL = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  CSV = 'text/csv'
}