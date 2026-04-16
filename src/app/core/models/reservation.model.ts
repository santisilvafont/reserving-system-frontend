import { User } from "./user.model";
import { Group } from "./group.model";
import { Hall } from "./hall.model";

export interface Reservation {
    id: string;
    startTime: string;
    endTime: string;
    createdAt: string;
    purpose: string;
    applicationNotes?: string;
    rejectionReason?: string;
    state: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
    user: User;
    group: Group;
    hall: Hall;
  }