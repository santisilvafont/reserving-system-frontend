import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../../core/api.token';

export interface Group {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class GroupsService {
  private http = inject(HttpClient);
  private baseUrl = inject(API_URL);

  getGroups() {
    return this.http.get<Group[]>(`${this.baseUrl}/groups`); 
  }

  createGroup(group: Partial<Group>) {
    return this.http.post<Group>(`${this.baseUrl}/groups`, group);
  }

  updateGroup(id: string, group: Partial<Group>) {
    return this.http.patch<Group>(`${this.baseUrl}/groups/${id}`, group);
  }

  toggleStatus(id: string, isActive: boolean) {
    return this.http.patch<Group>(`${this.baseUrl}/groups/${id}`, { isActive });
  }
}