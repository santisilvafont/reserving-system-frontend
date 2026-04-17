import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { API_URL } from '../core/api.token';
import { User } from '../core/models/user.model';
import { LoginPayload } from '../core/models/login-payload.model';
import { AuthResponse } from '../core/models/auth-response.model';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL); 
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  private getUserFromStorage(): User | null {
    const data = localStorage.getItem('user');
    return data ? JSON.parse(data) : null;
  }

  login(credentials: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials);
  }

  setSession(authResult: AuthResponse): void {
    localStorage.setItem('token', authResult.accessToken);
    localStorage.setItem('user', JSON.stringify(authResult.user));
    this.currentUserSubject.next(authResult.user);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
   }

   isLoggedIn(): boolean {
    return localStorage.getItem('token') !== null;
   }

   register(userData: User): Observable<Object> {
    return this.http.post(`${this.apiUrl}/auth/register`, userData); 
  }

  forgotPassword(email: string): Observable<Object> {
    return this.http.post(`${this.apiUrl}/auth/forgot-password`, { email });
  }

  resetPassword(data: any): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/auth/reset-password`, data);
  }

  updateCurrentUsername(newName: string): void {
    const currentUser = this.currentUserSubject.value;
    
    if (currentUser) {
      currentUser.name = newName;
      localStorage.setItem('user', JSON.stringify(currentUser));
      this.currentUserSubject.next(currentUser);
    }
  }
}