import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})

export class Register {
  backendErrorMessage: string | null = null;
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isHoveringSubmit: boolean = false;

  registerForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  get formErrorMessage(): string | null {
    if (this.registerForm.valid) return null;

    const nameCtrl = this.registerForm.get('name');
    const emailCtrl = this.registerForm.get('email');
    const passCtrl = this.registerForm.get('password');

    if (nameCtrl?.hasError('required')) return 'Full Name is required.';
    if (nameCtrl?.hasError('minlength')) return 'Name must be at least 3 characters.';
    
    if (emailCtrl?.hasError('required')) return 'Email is required.';
    if (emailCtrl?.hasError('email')) return 'Please enter a valid email address.';
    
    if (passCtrl?.hasError('required')) return 'Password is required.';
    if (passCtrl?.hasError('minlength')) return 'Password must be at least 8 characters.';

    return 'Please complete the form correctly.';
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;
    this.backendErrorMessage = null;

    const formData = this.registerForm.value;

    this.authService.register(formData).subscribe({
      next: () => {
        this.authService.login({ email: formData.email, password: formData.password }).subscribe({
          next: (res) => {
            this.authService.setSession(res);
            this.router.navigate(['/dashboard']);
          },
          error: () => {
            this.router.navigate(['/login']);
          }
        });
      },
      error: (err) => {
        console.error('[Register] Backend Error:', err);
        const msg = err.error?.message;
        
        this.backendErrorMessage = Array.isArray(msg) ? msg[0] : (msg || 'Registration failed. Please try again.');

        this.cdr.detectChanges();
      }
    });
  }
}