import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../auth/auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../../../core/models/user.model';
import { GroupsService } from '../groups/groups.service';
import { Group } from '../../../core/models/group.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})

export class Profile implements OnInit {
  private fb = inject(FormBuilder);
  private usersService = inject(UsersService);
  private cdr = inject(ChangeDetectorRef);
  private authService = inject(AuthService);
  private groupsService = inject(GroupsService);

  currentUserId: string = '';

  profileForm: FormGroup;
  passwordForm: FormGroup;

  profileSuccess: string | null = null;
  profileError: string | null = null;
  passwordSuccess: string | null = null;
  passwordError: string | null = null;

  isHoveringProfile: boolean = false;
  isHoveringPassword: boolean = false;

  allGroups: Group[] = [];
  initialGroupIds: Set<string> = new Set();
  selectedGroupIds: Set<string> = new Set();
  groupUpdateMessage: string | null = null;

  isGroupsExpanded: boolean = false;
  groupUpdateType: 'success' | 'error' | 'neutral' | null = null;
  isSavingGroups: boolean = false;

  constructor() {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      description: ['', [Validators.maxLength(200)]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]],
      newPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]]
    });
  }

  get profileErrorMessage(): string | null {
    if (this.profileForm.valid) return null;

    const nameCtrl = this.profileForm.get('name');
    const emailCtrl = this.profileForm.get('email');
    const descCtrl = this.profileForm.get('description');

    if (nameCtrl?.hasError('required')) return 'Name is required.';
    if (nameCtrl?.hasError('minlength')) return 'Name must be at least 3 characters long.';
    if (nameCtrl?.hasError('maxlength')) return 'Name must be at most 50 characters long.';

    if (emailCtrl?.hasError('required')) return 'Email is required.';
    if (emailCtrl?.hasError('email')) return 'Please enter a valid email address.';

    if (descCtrl?.hasError('maxlength')) return 'Description must be at most 200 characters long.';

    return 'Please complete the form correctly.';
  }

  get passwordErrorMessage(): string | null {
    if (this.passwordForm.valid) return null;

    const currCtrl = this.passwordForm.get('currentPassword');
    const newCtrl = this.passwordForm.get('newPassword');
    const confCtrl = this.passwordForm.get('confirmPassword');

    if (currCtrl?.hasError('required')) return 'Current password is required.';
    
    if (newCtrl?.hasError('required')) return 'New password is required.';
    if (newCtrl?.hasError('minlength')) return 'New password must be at least 8 characters long.';
    if (newCtrl?.hasError('maxlength')) return 'New password must be at most 20 characters long.';

    if (confCtrl?.hasError('required')) return 'Please confirm your new password.';
    if (confCtrl?.hasError('minlength')) return 'Confirm password must be at least 8 characters long.';
    if (confCtrl?.hasError('maxlength')) return 'Confirm password must be at most 20 characters long.';

    return 'Please complete the form correctly.';
  }

  ngOnInit(): void {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      this.currentUserId = user.id;
      this.loadUserData();
      this.loadAllGroups();
    }
  }

  onToggleGroupLocal(group: Group, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    if ( !group.isActive ) {
      event.preventDefault();
      return
    }
    if (isChecked) {
      this.selectedGroupIds.add(group.id);
    } else {
      this.selectedGroupIds.delete(group.id);
    }
  }

  onProfileSubmit(): void {
    if (this.profileForm.invalid) return;
    this.profileError = null;
    this.profileSuccess = null;

    this.usersService.updateUser(this.currentUserId, this.profileForm.value).subscribe({
      next: (updatedUser) => {
        this.profileSuccess = 'Profile information updated successfully!';
        const sessionData = JSON.parse(localStorage.getItem('user') || '{}');
        sessionData.name = updatedUser.name;
        localStorage.setItem('user', JSON.stringify(sessionData));
        this.authService.updateCurrentUsername(updatedUser.name);
        this.cdr.detectChanges();
      },
      error: (err) => {
        const msg = err.error?.message;
        this.profileError = Array.isArray(msg) ? msg[0] : (msg || 'Error updating profile.');
        this.cdr.detectChanges();
      }
    });
  }

  onPasswordSubmit(): void {
    if (this.passwordForm.invalid) return;
    this.passwordError = null;
    this.passwordSuccess = null;

    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;

    if (newPassword !== confirmPassword) {
      this.passwordError = 'The new passwords do not match.';
      return;
    }

    const passwordData = { currentPassword, newPassword, confirmPassword };

    this.usersService.updateUser(this.currentUserId, passwordData).subscribe({
      next: () => {
        this.passwordSuccess = 'Password changed successfully!';
        this.passwordForm.reset();
        this.cdr.detectChanges();
      },
      error: (err) => {
        const msg = err.error?.message;
        this.passwordError = Array.isArray(msg) ? msg[0] : (msg || 'Error changing password.');
        this.cdr.detectChanges();
      }
    });
  }

  toggleGroupsAccordion(): void {
    this.isGroupsExpanded = !this.isGroupsExpanded;
  }

  saveGroups(): void {
    const addedGroups = [...this.selectedGroupIds].filter(id => !this.initialGroupIds.has(id));
    const removedGroups = [...this.initialGroupIds].filter(id => !this.selectedGroupIds.has(id));

    if (addedGroups.length === 0 && removedGroups.length === 0) {
      this.groupUpdateMessage = 'No changes to save.';
      this.groupUpdateType = 'neutral'; 
      setTimeout(() => this.groupUpdateMessage = null, 3000);
      return;
    }

    this.isSavingGroups = true;
    this.groupUpdateMessage = null;

    const requests: any[] = [];
    
    addedGroups.forEach(id => {
      requests.push(this.usersService.addGroupToUser(this.currentUserId, id));
    });
    
    removedGroups.forEach(id => {
      requests.push(this.usersService.removeGroupToUser(this.currentUserId, id));
    });

    forkJoin(requests).subscribe({
      next: () => {
        this.groupUpdateMessage = 'Groups updated successfully!';
        this.groupUpdateType = 'success';
        this.initialGroupIds = new Set(this.selectedGroupIds); 
        this.isSavingGroups = false;
        setTimeout(() => this.groupUpdateMessage = null, 3000);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.groupUpdateMessage = 'Error updating some groups.';
        this.groupUpdateType = 'error';
        this.isSavingGroups = false;
        this.cdr.detectChanges();
      }
    });
  }
  
  loadAllGroups(): void {
    this.groupsService.getGroups().subscribe({
      next: (groups) => {
        this.allGroups = groups;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('[Profile] Error loading groups:', err)
    });
  }

  loadUserData(): void {
    this.usersService.getUser(this.currentUserId).subscribe({
      next: (user: User) => {
        this.profileForm.patchValue({
          name: user.name,
          email: user.email,
          description: user.description || ''
        });

        if (user.groups && user.groups.length > 0) {
          const ids = user.groups.map((g: any) => g.id);
          this.initialGroupIds = new Set(ids);
          this.selectedGroupIds = new Set(ids);
        }
        this.cdr.detectChanges();
      },
      error: (err) => console.error('[Profile] Error loading user data:', err)
    });
  }
}