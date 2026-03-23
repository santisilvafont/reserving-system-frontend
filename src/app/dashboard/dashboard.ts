import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser: CurrentUser | null = null;

  ngOnInit(): void {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.currentUser = JSON.parse(userData);
    }
  }

  onLogout(): void {
    console.log('[Auth] User initiated logout.');
    this.authService.logout(); 
    this.router.navigate(['/login']); 
  }
}