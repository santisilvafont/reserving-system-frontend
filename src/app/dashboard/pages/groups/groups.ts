import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { GroupsService } from './groups.service';
import { Group } from '../../../core/models/group.model';

@Component({
  selector: 'app-groups',
  imports: [ReactiveFormsModule],
  templateUrl: './groups.html',
  styleUrl: './groups.scss'
})

export class Groups implements OnInit {
  private groupsService = inject(GroupsService);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);

  isAdmin: boolean = false;
  groupsList: Group[] = [];
  
  showModal: boolean = false;
  isEditing: boolean = false;
  currentEditingId: string | null = null;
  isHoveringSubmit: boolean = false;

  groupForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    description: ['', [Validators.maxLength(200)]],
    isActive: [true]
  });

  get formErrorMessage(): string | null {
    if (this.groupForm.valid) return null;

    const nameCtrl = this.groupForm.get('name');
    const descCtrl = this.groupForm.get('description');

    if (nameCtrl?.hasError('required')) {
      return 'Name is required to save.'
    };
    if (nameCtrl?.hasError('minlength')) {
      return 'Name must be at least 3 characters long.'
    };
    if (nameCtrl?.hasError('maxlength')) {
      return 'Name must be at most 50 characters long.'
    };
    if (descCtrl?.hasError('maxlength')) {
      return 'Description must be at most 200 characters long.'
    };

    return 'Please complete the form correctly.';
  }

  ngOnInit(): void {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      this.isAdmin = user.isAdmin;
    }
    this.loadGroups();
  }
  
  onToggleStatus(group: Group): void {
    const newStatus = !group.isActive;
    this.groupsService.toggleStatus(group.id, newStatus).subscribe({
      next: () => this.loadGroups(),
      error: (err) => console.error('[Groups] Error toggling status:', err)
    });
  }

  loadGroups(): void {
    this.groupsService.getGroups().subscribe({
      next: (data: Group[]) => {
        this.groupsList = data;
        this.cdr.detectChanges();
      },
      error: (err: Error) => console.error('[Groups] Error fetching data:', err)
    });
  }

  openModal(group?: Group) {
    if (group) {
      this.isEditing = true;
      this.currentEditingId = group.id;
      this.groupForm.patchValue({
        name: group.name,
        description: group.description,
        isActive: group.isActive
      });
    } else {
      this.isEditing = false;
      this.currentEditingId = null;
      this.groupForm.reset({ isActive: true });
    }
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.groupForm.reset();
  }

  saveGroup(): void {
    if (this.groupForm.invalid) return;

    const formData = this.groupForm.value;

    if (this.isEditing && this.currentEditingId) {
      this.groupsService.updateGroup(this.currentEditingId, formData).subscribe({
        next: () => {
          this.loadGroups();
          this.closeModal();
        },
        error: (err) => console.error('[Groups] Error updating:', err)
      });
    } else {
      this.groupsService.createGroup(formData).subscribe({
        next: () => {
          this.loadGroups();
          this.closeModal();
        },
        error: (err) => console.error('[Groups] Error creating:', err)
      });
    }
  }
}