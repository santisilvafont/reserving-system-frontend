import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-forgot-password',
  imports: [ ReactiveFormsModule, RouterLink ],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPassword {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private cdr = inject (ChangeDetectorRef);

  isHoveringSubmit: boolean = false;
  backendErrorMessage: string | null = null;
  successMessage: string | null = null;

  forgotForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  get formErrorMessage(): string | null {
    if (this.forgotForm.valid) return null;

    const emailCtrl = this.forgotForm.get('email');

    if (emailCtrl?.hasError('required')) return 'Email is required';

    if (emailCtrl?.hasError('email')) return 'Please enter a valid email address';

    return 'Please complete the form correctly';
  }

  onSubmit(): void {
    if (this.forgotForm.invalid) return;

    this.backendErrorMessage = null;
    this.successMessage = null;

    const email = this.forgotForm.value.email;

    this.authService.forgotPassword(email).subscribe({
      next: () => {
        this.successMessage = 'If that email is in our system, we have sent a reset link.'
        this.forgotForm.reset();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[Forgot Password] Error: ', err);
        const msg = err.error?.message;
        this.backendErrorMessage = Array.isArray(msg) ? msg[0] : (msg || 'Error processing request.');
        this.cdr.detectChanges();
      }
    });

  }
}
