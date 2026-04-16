export interface CreateReservationDto {
    startTime: string; 
    endTime: string;
    purpose: string;
    applicationNotes?: string;
    groupId: string;
    hallId: string;
  }