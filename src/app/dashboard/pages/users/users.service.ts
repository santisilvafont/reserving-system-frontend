import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../../core/api.token';
import { Observable } from 'rxjs';
import { User } from '../../../core/models/user.model';

@Injectable({
  providedIn: 'root'
})

export class UsersService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`); 
  }

  createUser(user: any): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users`, user);
  }

  updateUser(id: string, user: any): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/users/${id}`, user);
  }

  toggleAdminRole(userId: string, isAdmin: boolean) {
    return this.http.patch(`${this.apiUrl}/users/${userId}/role`, { isAdmin });
  }

  toggleStatus(id: string, isActive: boolean): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/users/${id}/status`, { isActive });
  }

  getUser(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`);
  }

  addGroupToUser(userId: string, groupId: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users/${userId}/groups/${groupId}`, {});
  }

  removeGroupToUser(userId: string, groupId: string): Observable<User> {
    return this.http.delete<User>(`${this.apiUrl}/users/${userId}/groups/${groupId}`);
  }
}