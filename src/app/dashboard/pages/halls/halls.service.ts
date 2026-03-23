import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Hall } from './halls'; 
import { API_URL } from '../../../core/api.token';

@Injectable({
  providedIn: 'root'
})
export class HallsService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL); 

  getHalls() {
    return this.http.get<Hall[]>(`${this.apiUrl}/halls`); 
  }

  createHall(hall: Partial<Hall>) {
    return this.http.post<Hall>(`${this.apiUrl}/halls`, hall);
  }

  updateHall(id: string, hall: Partial<Hall>) {
    return this.http.patch<Hall>(`${this.apiUrl}/halls/${id}`, hall);
  }

  toggleStatus(id: string, isActive: boolean) {
    return this.http.patch<Hall>(`${this.apiUrl}/halls/${id}`, { isActive });
  }
}