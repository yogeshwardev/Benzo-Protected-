export type UserRole = "SUPER_ADMIN" | "ADMIN" | "INSTRUCTOR" | "STUDENT";

export type OrderStatus =
  | "CREATED"
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

export type AttendanceState = "PRESENT" | "PARTIAL" | "ABSENT";

export interface CourseSummary {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  priceInPaise: number;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  scheduleLabel: string;
}

export interface ApiEnvelope<T> {
  data: T;
  requestId: string;
}

export interface ApiError {
  code: string;
  message: string;
  requestId: string;
  details?: unknown;
}

