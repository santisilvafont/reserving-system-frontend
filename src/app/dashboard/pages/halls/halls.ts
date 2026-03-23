import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HallsService } from './halls.service';

export interface Hall {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

@Component({
  selector: 'app-halls',
  imports: [ ReactiveFormsModule ],
  templateUrl: './halls.html',
  styleUrl: './halls.scss'
})
export class Halls implements OnInit {
  private hallsService = inject(HallsService);
  private cdr = inject(ChangeDetectorRef)
  private fb = inject(FormBuilder);

  isAdmin: boolean = false;
  hallsList: Hall[] = [];
  showModal: boolean = false;
  isEditing: boolean = false;
  currentEditingId: string | null = null;
  isHoveringSubmit: boolean = false;

  hallForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    description: ['', [Validators.maxLength(200)]],
    isActive: [true]
  });

  get formErrorMessage(): string | null {
    if (this.hallForm.valid) return null;

    const nameCtrl = this.hallForm.get('name');
    const descCtrl = this.hallForm.get('description');

    if (nameCtrl?.hasError('required')) {
      return 'Name is required to save.';
    }
    if (nameCtrl?.hasError('minlength')) {
      return 'Name must be at least 3 characters long.';
    }
    if (nameCtrl?.hasError('maxlength')) {
      return 'Name must be at most 50 characters long.';
    }

    if (descCtrl?.hasError('maxlength')) {
      return 'Description must be at most 200 characters long.';
    }

    return 'Please complete the form correctly.';
  }

  ngOnInit(): void {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      this.isAdmin = user.isAdmin;
    }

    this.loadHalls();
  }

  loadHalls(): void {
    this.hallsService.getHalls().subscribe({
      next: (data: Hall[]) => {
        console.log('[Halls] Data loaded successfully from NestJS:', data);
        this.hallsList = data;
        this.cdr.detectChanges();
      },
      error: (err: Error) => {
        console.error('[Halls] Error fetching data from backend:', err);
      }
    });
  }

  openModal(hall?: Hall) {
    if (hall) {
      this.isEditing = true;
      this.currentEditingId = hall.id;
      this.hallForm.patchValue({
        name: hall.name,
        description: hall.description,
        isActive: hall.isActive
      })
    } else {
      this.isEditing = false;
      this.currentEditingId = null;
      this.hallForm.reset({ isActive: true });
    }
    this.showModal = true;
  }

  saveHall() {
    if (this.hallForm.invalid) return;

    const formData = this.hallForm.value;

    if (this.isEditing && this.currentEditingId) {
      this.hallsService.updateHall(this.currentEditingId, formData).subscribe({
        next: () => {
          this.loadHalls();
          this.closeModal();
        },
        error: (err) => console.error('[Halls] Error updating:', err)
      });
    } else {
      this.hallsService.createHall(formData).subscribe({
        next: () => {
          this.loadHalls();
          this.closeModal();
        },
        error: (err) => console.error('[Halls] Error creating:', err)
      });
    }
  }

  closeModal() {
    this.showModal = false;
    this.hallForm.reset();
  }

  onToggleStatus(hall: Hall) {
    const newStatus = !hall.isActive;
    this.hallsService.toggleStatus(hall.id, newStatus).subscribe({
      next: () => this.loadHalls(),
      error: (err) => console.error('[Halls] Error toggling status:', err)
    });
  }
}