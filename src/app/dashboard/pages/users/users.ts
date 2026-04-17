import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UsersService } from './users.service';
import { User } from '../../../core/models/user.model';
import { environment } from '../../../../environments/environment.development';

@Component({
  selector: 'app-users',
  imports: [ReactiveFormsModule],
  templateUrl: './users.html',
  styleUrl: './users.scss'
})

export class Users implements OnInit {
  private usersService = inject(UsersService);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);
  superAdminEmail: string = environment.superAdminEmail;

  currentUserIsAdmin: boolean = false;
  currentUserId: string | null = null;
  usersList: User[] = [];
  
  showModal: boolean = false;
  isEditing: boolean = false;
  currentEditingId: string | null = null;
  isHoveringSubmit: boolean = false;
  backendErrorMessage: string | null = null;

  userForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email]],
    description: ['', [Validators.maxLength(200)]],
    password: [''] 
  });

  get formErrorMessage(): string | null {
    if (this.userForm.valid) return null;

    const nameCtrl = this.userForm.get('name');
    const emailCtrl = this.userForm.get('email');
    const passCtrl = this.userForm.get('password');
    const descCtrl = this.userForm.get('description');

    if (nameCtrl?.hasError('required')) return 'Name is required.';
    if (nameCtrl?.hasError('minlength')) return 'Name must be at least 3 characters long.';
    if (nameCtrl?.hasError('maxlength')) return 'Name must be at most 50 characters long.';

    if (emailCtrl?.hasError('required')) return 'Email is required.';
    if (emailCtrl?.hasError('email')) return 'Please enter a valid email address.';

    if (passCtrl?.hasError('required')) return 'Password is required for new users.';
    if (passCtrl?.hasError('minlength')) return 'Password must be at least 8 characters long.';
    if (passCtrl?.hasError('maxlength')) return 'Password must be at most 20 characters long.';

    if (descCtrl?.hasError('maxlength')) return 'Description must be at most 200 characters long.';

    return 'Please complete the form correctly.';
  }

  ngOnInit(): void {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      this.currentUserIsAdmin = user.isAdmin;
      this.currentUserId = user.id;
    }
    this.loadUsers();
  }

  onToggleStatus(user: User): void {
    const newStatus = !user.isActive;
    this.usersService.toggleStatus(user.id, newStatus).subscribe({
      next: () => this.loadUsers(),
      error: (err) => console.error('[Users] Error toggling status:', err)
    });
  }

  onToggleAdmin(user: User) {
    if (user.email === this.superAdminEmail) return; 

    const newRole = !user.isAdmin;
    
    user.isAdmin = newRole;
    this.cdr.detectChanges();

    this.usersService.toggleAdminRole(user.id, newRole).subscribe({
      next: () => {
      },
      error: (err) => {
        user.isAdmin = !newRole;
        this.cdr.detectChanges();
        console.error('Error toggling role:', err);
      }
    });
  }

  loadUsers(): void {
    this.usersService.getUsers().subscribe({
      next: (data: User[]) => {
        this.usersList = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('[Users] Error fetching data:', err)
    });
  }

  openModal(user?: User): void {
    this.backendErrorMessage = null;
    this.isHoveringSubmit = false;
    
    const passwordControl = this.userForm.get('password');

    if (user) {
      this.isEditing = true;
      this.currentEditingId = user.id;
      
      passwordControl?.clearValidators(); 
      passwordControl?.updateValueAndValidity();

      this.userForm.patchValue({
        name: user.name,
        email: user.email,
        description: user.description || ''
      });
    } else {
      this.isEditing = false;
      this.currentEditingId = null;
      
      passwordControl?.setValidators([Validators.required, Validators.minLength(8), Validators.maxLength(20)]);
      passwordControl?.updateValueAndValidity();

      this.userForm.reset();
    }
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.userForm.reset();
  }

  saveUser(): void {
    if (this.userForm.invalid) return;
    this.backendErrorMessage = null;

    const formData = { ...this.userForm.value };

    if (this.isEditing && this.currentEditingId) {
      delete formData.password; 

      this.usersService.updateUser(this.currentEditingId, formData).subscribe({
        next: () => {
          this.loadUsers();
          this.closeModal();
        },
        error: (err) => this.handleBackendError(err)
      });
    } else {
      this.usersService.createUser(formData).subscribe({
        next: () => {
          this.loadUsers();
          this.closeModal();
        },
        error: (err) => this.handleBackendError(err)
      });
    }
  }

  private handleBackendError(err: any): void {
    console.error('[Users] Backend Error:', err);
    const msg = err.error?.message;
    this.backendErrorMessage = Array.isArray(msg) ? msg[0] : (msg || 'Error processing request.');
    this.cdr.detectChanges();
  }
}