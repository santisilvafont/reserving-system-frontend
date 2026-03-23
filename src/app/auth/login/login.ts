import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  backendErrorMessage: string | null = null;
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isHoveringSubmit: boolean = false;

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  get formErrorMessage(): string | null {
    if (this.loginForm.valid) return null;

    const emailCtrl = this.loginForm.get('email');
    const passCtrl = this.loginForm.get('password');

    if (emailCtrl?.hasError('required')) return 'Email is required.';
    if (emailCtrl?.hasError('email')) return 'Please enter a valid email address.';
    
    if (passCtrl?.hasError('required')) return 'Password is required.';
    if (passCtrl?.hasError('minlength')) return 'Password must be at least 8 characters.';

    return 'Please complete the form correctly.';
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.authService.setSession(res);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('[Login] Error:', err);
        const msg = err.error?.message;
        this.backendErrorMessage = Array.isArray(msg) ? msg[0] : (msg || 'Invalid email or password')

        this.cdr.detectChanges();
      }
    });
  }
}