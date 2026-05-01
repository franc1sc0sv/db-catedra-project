export interface ScheduleEvent {
  id: string
  eventDate: string
  startTime: string
  endTime: string
  eventType: 'appointment' | 'block' | 'vacation' | 'meeting'
  availabilityStatus: 'available' | 'busy' | 'blocked' | 'completed' | 'cancelled'
}

export interface AvailableSlot {
  id: string
  eventDate: string
  startTime: string
  endTime: string
  doctorName?: string
  specialty?: string
}
