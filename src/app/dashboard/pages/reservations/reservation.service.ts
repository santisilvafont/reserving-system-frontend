import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../../core/api.token';
import { Reservation } from '../../../core/models/reservation.model';
import { CreateReservationDto } from '../../../core/models/create-reservation-dto.model';

@Injectable({
  providedIn: 'root'
})

export class ReservationsService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);
  private baseUrl = `${this.apiUrl}/reservations`;

  getReservations(startDate?: string, endDate?: string): Observable<Reservation[]> {
    let params = new HttpParams;
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<Reservation[]>(this.baseUrl, { params });
  }

  createReservation(data: CreateReservationDto): Observable<Reservation> {
    return this.http.post<Reservation>(this.baseUrl, data);
  }

  deleteReservation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  approveReservation(id: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/approve`, {});
  }

  rejectReservation(id: string, reason: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/reject`, { reason });
  }

  cancelReservation(id: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/cancel`, {});
  }
}