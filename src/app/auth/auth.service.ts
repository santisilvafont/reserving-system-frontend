import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../core/api.token';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    isAdmin: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL); 

  login(credentials: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials);
  }

  setSession(authResult: AuthResponse): void {
    localStorage.setItem('token', authResult.accessToken);
    localStorage.setItem('user', JSON.stringify(authResult.user));
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
   }

   isLoggedIn(): boolean {
    return localStorage.getItem('token') !== null;
   }

   register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, userData); 
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/forgot-password`, { email });
  }
}