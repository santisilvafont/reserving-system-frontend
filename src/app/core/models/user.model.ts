import { Group } from "./group.model";

export interface User {
    id: string;
    name: string;
    email: string;
    description?: string;
    isActive: boolean;
    isAdmin: boolean;
    groups: Group[];
  }