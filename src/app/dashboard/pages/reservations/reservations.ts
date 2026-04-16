import { Component, OnInit, inject, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { FullCalendarModule, FullCalendarComponent } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CommonModule } from '@angular/common';

import { ReservationsService } from './reservation.service';
import { Reservation } from '../../../core/models/reservation.model';
import { HallsService } from '../halls/halls.service';
import { Hall } from '../../../core/models/hall.model';
import { UsersService } from '../users/users.service'
import { User } from '../../../core/models/user.model';
import { Group } from '../../../core/models/group.model';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [FullCalendarModule, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './reservations.html',
  styleUrl: './reservations.scss'
})

export class Reservations implements OnInit {
  private reservationsService = inject(ReservationsService);
  private hallsService = inject(HallsService);
  private usersService = inject(UsersService);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);

  constructor() {
    this.createForm = this.fb.group({
      date: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      hallId: ['', Validators.required],
      groupId: ['', Validators.required],
      purpose: ['', [Validators.required, Validators.maxLength(250)]],
      applicationNotes: [''],
    });
    this.filterForm = this.fb.group({
      status: [['ALL']],
      hallId: [['ALL']],
      userId: [['ALL']],
    });

    this.filterForm.valueChanges.subscribe(() => {
      this.applyTableFilters();
    });
  }

  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  isLoading: boolean = true;
  errorMessage: string | null = null;
  
  reservationsList: Reservation[] = [];
  availableHalls: Hall[] = [];
  myGroups: Group[] = [];

  currentUserId: string = '';
  activeTab: 'calendar' | 'history' = 'calendar';
  currentUserInfo: User | null = null;

  isModalOpen: boolean = false;
  selectedEvent: any = null;

  isCreateModalOpen: boolean = false;
  createForm: FormGroup;
  isSaving: boolean = false;
  isHoveringSubmit: boolean = false;
  backendErrorMessage: string | null = null;
  successMessage: string | null = null;
  minDate: string = '';
  timeSlots: { value: string, label: string }[] = [];

  filterForm: FormGroup;
  tableReservations: Reservation[] = [];
  uniqueUsers: {id: string, name: string}[] = [];

  actionModalType: 'APPROVE' | 'REJECT' | 'CANCEL' | null = null;
  actionReservationId: string | null = null;
  rejectReasonText: string = '';
  actionErrorMessage: string | null = null; 
  isActionProcessing: boolean = false;

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    slotEventOverlap: false,
    views: {
      timeGridWeek: {
        dayHeaderFormat: { weekday: 'short', day: 'numeric', omitCommas: true },
      },
      timeGridDay: {
        dayHeaderFormat: { weekday: 'long', day: 'numeric', omitCommas: true },
      },
      dayGridMonth: {
        dayHeaderFormat: { weekday: 'short' },
      },
    },
    events: [],
    allDaySlot: false,
    slotMinTime: '06:00:00',
    slotMaxTime: '24:00:00',
    height: 'auto',
    datesSet: (dateInfo) => {
      this.fetchReservationsForRange(dateInfo.startStr, dateInfo.endStr);
    },
    
    eventClick: (info) => {
      this.selectedEvent = {
        id: info.event.id,
        title: info.event.title,
        start: info.event.start,
        end: info.event.end,
        ...info.event.extendedProps
      };
      this.isModalOpen = true;
      this.cdr.detectChanges();
    }
  };

  get formErrorMessage(): string | null {
    if (this.createForm.valid) return null;

    const groupCtrl = this.createForm.get('groupId');
    const hallCtrl = this.createForm.get('hallId');
    const dateCtrl = this.createForm.get('date');
    const startCtrl = this.createForm.get('startTime');
    const endCtrl = this.createForm.get('endTime');
    const purposeCtrl = this.createForm.get('purpose');

    if (groupCtrl?.hasError('required')) return 'Please select a Group.';
    if (hallCtrl?.hasError('required')) return 'Please select a Hall.';
    if (dateCtrl?.hasError('required')) return 'Please select a Date.';
    if (startCtrl?.hasError('required')) return 'Please set a Start Time.';
    if (endCtrl?.hasError('required')) return 'Please set an End Time.';
    if (purposeCtrl?.hasError('required')) return 'Purpose is required.';
    if (purposeCtrl?.hasError('maxlength')) return 'Purpose is too long (Max 250).';

    return 'Please complete the form correctly.';
  }
  
  ngOnInit(): void {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      this.currentUserId = user.id;
      this.loadStaticData();
    } else {
      this.errorMessage = 'User session not found.';
      this.isLoading = false;
    }
    this.minDate = new Date().toISOString().split('T')[0];
    this.generateTimeSlots();
  }

  onSubmitCreate(): void {
    if (this.createForm.invalid) return;

    this.isSaving = true;
    this.backendErrorMessage = null;
    const formValue = this.createForm.value;

    try {
      const [year, month, day] = formValue.date.split('-').map(Number);
      const [startHour, startMin] = formValue.startTime.split(':').map(Number);
      const [endHour, endMin] = formValue.endTime.split(':').map(Number);

      const startDateTime = new Date(year, month - 1, day, startHour, startMin);
      const endDateTime = new Date(year, month - 1, day, endHour, endMin);
      const now = new Date();

      if (startDateTime < now) {
        this.backendErrorMessage = 'Start time cannot be in the past.';
        this.isSaving = false;
        return;
      }

      if (endDateTime <= startDateTime) {
        this.backendErrorMessage = 'End time cannot be before Start time.';
        this.isSaving = false;
        return;
      }

      const payload = {
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        purpose: formValue.purpose,
        applicationNotes: formValue.applicationNotes || '',
        groupId: formValue.groupId,
        hallId: formValue.hallId
      };

      this.reservationsService.createReservation(payload).subscribe({
        next: () => {
          this.isSaving = false;
          this.closeCreateModal();
          this.showSuccessMessage('Reservation created successfully! It is now PENDING approval.');
          
          const calendarApi = this.calendarComponent.getApi();
          const view = calendarApi.view;
          this.fetchReservationsForRange(view.activeStart.toISOString(), view.activeEnd.toISOString());
        },
        error: (err) => {
          console.error(err);
          this.isSaving = false;
          const msg = err.error?.message;
          this.backendErrorMessage = Array.isArray(msg) ? msg[0] : (msg || 'Error creating reservation.');
          this.cdr.detectChanges();
        }
      });

    } catch (error) {
      this.backendErrorMessage = "Error processing dates.";
      this.isSaving = false;
    }
  }

  generateTimeSlots(): void {
    const slots = [];
    for (let i = 7; i <= 22; i++) {
      const h24 = i.toString().padStart(2, '0');
      const h12 = i > 12 ? i - 12 : (i === 0 ? 12 : i);
      const ampm = i >= 12 ? 'PM' : 'AM';

      slots.push({ value: `${h24}:00`, label: `${h12}:00 ${ampm}` });
      if (i !== 22) {
        slots.push({ value: `${h24}:30`, label: `${h12}:30 ${ampm}` });
      }
    }
    this.timeSlots = slots;
  }
  
  switchTab(tab: 'calendar' | 'history'): void {
    this.activeTab = tab;
    if (tab === 'history') {
      this.loadHistoricalData();
    }
  }

  loadHistoricalData(): void {
    this.isLoading = true;
    const defaultStatus = this.currentUserInfo?.isAdmin ? ['PENDING'] : ['ALL'];
    this.filterForm.patchValue({ status: defaultStatus }, { emitEvent: false });

    this.reservationsService.getReservations().subscribe({
      next: (reservations) => {
        this.reservationsList = reservations;
        const userMap = new Map();
        reservations.forEach(res => {
          if (res.user) userMap.set(res.user.id, res.user.name);
        });
        this.uniqueUsers = Array.from(userMap, ([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
        this.applyTableFilters();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading history:', err);
        this.isLoading = false;
      }
    });
  }

  applyTableFilters(): void {
    const filters = this.filterForm.value;
    
    this.tableReservations = this.reservationsList.filter(res => {
      const resState = res.state ? res.state.toUpperCase() : 'PENDING';
      
      const matchStatus = filters.status.includes('ALL') || filters.status.includes(resState);
      const matchHall = filters.hallId.includes('ALL') || filters.hallId.includes(res.hall.id);
      
      const safeUserId = res.user?.id || '';
      const matchUser = !filters.userId || filters.userId.includes('ALL') || filters.userId.includes(safeUserId);
      
      return matchStatus && matchHall && matchUser;
    });
    
    this.tableReservations.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }

  loadStaticData(): void {
    forkJoin({
      halls: this.hallsService.getHalls(),
      userProfile: this.usersService.getUser(this.currentUserId)
    }).subscribe({
      next: (results) => {
        this.currentUserInfo = results.userProfile;
        this.availableHalls = results.halls.filter(hall => hall.isActive);
        
        if (results.userProfile.groups) {
          this.myGroups = results.userProfile.groups.filter((g: Group) => g.isActive);
        }
        
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  fetchReservationsForRange(start: string, end: string): void {
    this.reservationsService.getReservations(start, end).subscribe({
      next: (reservations) => {
        this.reservationsList = reservations;
        this.mapReservationsToCalendarEvents();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching reservations:', err);
      }
    });
  }
  
  mapReservationsToCalendarEvents(): void {
    const calendarReservations = this.reservationsList.filter(res => {
      const state = res.state ? res.state.toUpperCase() : 'PENDING';

      if (state === 'REJECTED' || state === 'CANCELLED') {
        return false;
      }

      if (state === 'PENDING') {
        return this.currentUserInfo?.isAdmin || res.user?.id === this.currentUserId;
      }

      return state === 'APPROVED';
    });

    const events: EventInput[] = calendarReservations.map(res => {
      const state = res.state ? res.state.toUpperCase() : 'PENDING';
      
      let eventClass = 'event-pending';
      if (state === 'APPROVED') eventClass = 'event-approved';

      return {
        id: res.id,
        title: `${res.group.name} - ${res.hall.name}`,
        start: res.startTime,
        end: res.endTime,
        classNames: [eventClass], 
        extendedProps: {
          purpose: res.purpose,
          status: state,
          user: res.user?.name,
          userId: res.user.id,
          hall: res.hall.name,
          group: res.group.name
        }
      };
    });

    this.calendarOptions.events = events;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedEvent = null;
  }

  openCreateModal(): void {
    this.createForm.reset();
    this.backendErrorMessage = null;
    this.isHoveringSubmit = false;
    this.isCreateModalOpen = true;
  }

  closeCreateModal(): void {
    this.isCreateModalOpen = false;
  }

  openActionModal(type: 'APPROVE' | 'REJECT' | 'CANCEL', id: string): void {
    this.isModalOpen = false;
    this.actionModalType = type;
    this.actionReservationId = id;
    this.rejectReasonText = '';
    this.actionErrorMessage = null;
    this.isActionProcessing = false;
  }

  closeActionModal(): void {
    this.actionModalType = null;
    this.actionReservationId = null;
  }

  confirmAction() {
    if (!this.actionReservationId) return;
    const id = this.actionReservationId;
    
    this.actionErrorMessage = null;
    this.isActionProcessing = true;

    if (this.actionModalType === 'APPROVE') {
      this.reservationsService.approveReservation(id).subscribe({
        next: () => {
          this.showSuccessMessage('Reservation Approved successfully.');
          this.closeActionModal();
          this.refreshCurrentView();
          this.isActionProcessing = false;
        },
        error: (err) => { 
          const msg = err.error?.message || 'Failed to approve reservation.';
          this.actionErrorMessage = Array.isArray(msg) ? msg[0] : msg; 
          this.isActionProcessing = false;
          this.cdr.detectChanges();
        }
      });
    } 
    else if (this.actionModalType === 'REJECT') {
      if (!this.rejectReasonText.trim()) return;
      this.reservationsService.rejectReservation(id, this.rejectReasonText).subscribe({
        next: () => {
          this.showSuccessMessage('Reservation Rejected.');
          this.closeActionModal();
          this.refreshCurrentView();
          this.isActionProcessing = false;
        },
        error: (err) => { 
          const msg = err.error?.message || 'Failed to reject reservation.';
          this.actionErrorMessage = Array.isArray(msg) ? msg[0] : msg; 
          this.isActionProcessing = false;
          this.cdr.detectChanges();
        }
      });
    } 
    else if (this.actionModalType === 'CANCEL') {
      this.reservationsService.cancelReservation(id).subscribe({
        next: () => {
          this.showSuccessMessage('Reservation Cancelled.');
          this.closeActionModal();
          this.refreshCurrentView();
          this.isActionProcessing = false;
        },
        error: (err) => { 
          const msg = err.error?.message || 'Failed to cancel reservation.';
          this.actionErrorMessage = Array.isArray(msg) ? msg[0] : msg; 
          this.isActionProcessing = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  showSuccessMessage(msg: string): void {
    this.successMessage = msg;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.successMessage = null;
      this.cdr.detectChanges();
    }, 4000);
  }

  refreshCurrentView(): void {
    if (this.activeTab === 'history') {
      this.loadHistoricalData();
    } else {
      const calendarApi = this.calendarComponent.getApi();
      const view = calendarApi.view;
      this.fetchReservationsForRange(view.activeStart.toISOString(), view.activeEnd.toISOString());
    }
  }

  toggleFilter(controlName: string, value: string): void {
    const currentValues = this.filterForm.get(controlName)?.value as string[];
    let updated: string[];

    if (value === 'ALL') {
      updated = ['ALL'];
    } else {
      updated = currentValues.filter(v => v !== 'ALL');
      if (updated.includes(value)) {
        updated = updated.filter(v => v !== value);
        if (updated.length === 0) updated = ['ALL'];
      } else {
        updated.push(value);
      }
    }
    this.filterForm.patchValue({ [controlName]: updated });
  }
}