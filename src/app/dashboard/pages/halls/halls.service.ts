import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Hall } from '../../../core/models/hall.model';
import { API_URL } from '../../../core/api.token';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class HallsService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL); 

  getHalls(): Observable<Hall[]> {
    return this.http.get<Hall[]>(`${this.apiUrl}/halls`); 
  }

  createHall(hall: Partial<Hall>): Observable<Hall> {
    return this.http.post<Hall>(`${this.apiUrl}/halls`, hall);
  }

  updateHall(id: string, hall: Partial<Hall>): Observable<Hall> {
    return this.http.patch<Hall>(`${this.apiUrl}/halls/${id}`, hall);
  }

  toggleStatus(id: string, isActive: boolean): Observable<Hall> {
    return this.http.patch<Hall>(`${this.apiUrl}/halls/${id}`, { isActive });
  }
}