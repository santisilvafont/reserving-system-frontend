import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { CurrentUser } from '../core/models/current-user.model';

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})

export class Dashboard implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  currentUser: CurrentUser | null = null;
  userName: string = '';

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      console.log('[Dashboard] Current user updated:', user);
      
      if  (user) {
        setTimeout(() => {
          this.userName = user.name || 'Invited User';
          this.currentUser = user;
          this.cdr.detectChanges();
        });
      }
    });
  }

  onLogout(): void {
    console.log('[Auth] User initiated logout.');
    this.authService.logout(); 
    this.router.navigate(['/login']); 
  }
}