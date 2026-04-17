import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.scss']
})
export class ResetPassword implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  token: string | null = null;
  isLoading = false;
  backendErrorMessage: string | null = null;
  successMessage: string | null = null;
  isHoveringSubmit: boolean = false;

  resetForm: FormGroup = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordsMatchValidator });

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
    
    if (!this.token) {
      this.backendErrorMessage = 'No reset token found in the URL. Please request a new link.';
    }
  }

  onSubmit() {
    if (this.resetForm.invalid || !this.token) return;

    this.isLoading = true;
    this.backendErrorMessage = null;
    
    const payload = {
      token: this.token,
      newPassword: this.resetForm.value.newPassword,
      confirmPassword: this.resetForm.value.confirmPassword
    };

    this.authService.resetPassword(payload).subscribe({
      next: (res) => {
        this.successMessage = res.message;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err.error?.message;
        this.backendErrorMessage = Array.isArray(msg) ? msg[0] : (msg || 'Failed to reset password.');
        this.cdr.detectChanges();
      }
    });
  }

  passwordsMatchValidator(form: FormGroup) {
    const password = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (!password || !confirmPassword) return null; 
    
    return password === confirmPassword ? null : { passwordMismatch: true };
  }
  get formErrorMessage(): string | null {
    if (this.resetForm.valid) return null;

    const newPassCtrl = this.resetForm.get('newPassword');
    const confirmPassCtrl = this.resetForm.get('confirmPassword');

    if (newPassCtrl?.hasError('required')) return 'New password is required.';
    if (newPassCtrl?.hasError('minlength')) return 'Password must be at least 8 characters.';

    if (confirmPassCtrl?.hasError('required')) return 'Please confirm your password.';

    if (this.resetForm.hasError('passwordMismatch')) return 'Passwords do not match.';

    return 'Please complete the form correctly.';
  }
}