import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../../core/api.token';
import { Group } from '../../../core/models/group.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class GroupsService {
  private http = inject(HttpClient);
  private baseUrl = inject(API_URL);

  getGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(`${this.baseUrl}/groups`); 
  }

  createGroup(group: Partial<Group>): Observable<Group> {
    return this.http.post<Group>(`${this.baseUrl}/groups`, group);
  }

  updateGroup(id: string, group: Partial<Group>): Observable<Group> {
    return this.http.patch<Group>(`${this.baseUrl}/groups/${id}`, group);
  }

  toggleStatus(id: string, isActive: boolean): Observable<Group> {
    return this.http.patch<Group>(`${this.baseUrl}/groups/${id}`, { isActive });
  }
}