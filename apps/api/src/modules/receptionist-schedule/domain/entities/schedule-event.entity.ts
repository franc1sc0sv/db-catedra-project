export type ScheduleEventType =
  | "appointment"
  | "block"
  | "vacation"
  | "meeting";
export type AvailabilityStatus =
  | "available"
  | "busy"
  | "blocked"
  | "completed"
  | "cancelled";

export interface IScheduleEvent {
  id: string;
  doctorId: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  eventType: ScheduleEventType;
  availabilityStatus: AvailabilityStatus;
  auditUserId: string | null;
}

export interface ConflictingAppointment {
  appointmentId: string;
  patientName: string;
  startTime: string;
}
