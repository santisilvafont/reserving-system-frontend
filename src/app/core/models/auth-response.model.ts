import { Group } from "./group.model";

export interface AuthResponse {
    accessToken: string;
    user: {
      id: string;
      email: string;
      name: string;
      isAdmin: boolean;
      isActive: boolean;
      groups: Group[];
    };
  }