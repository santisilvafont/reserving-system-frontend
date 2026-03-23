import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../../core/api.token';
import { Observable } from 'rxjs';

export interface User {
  id: string;
  name: string;
  email: string;
  description?: string;
  isActive: boolean;
  isAdmin: boolean;
}

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

  toggleStatus(id: string, isActive: boolean): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/users/${id}/status`, { isActive });
  }

  
}