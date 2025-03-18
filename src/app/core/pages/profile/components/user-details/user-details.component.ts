import { Component, OnInit, TemplateRef } from '@angular/core';
import { AuthService } from '../../../../../auth/services/auth.service';
import { last, Observable } from 'rxjs';
import { Badge, User } from '../../../../../interfaces/user';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProfileService } from '../../../../services/profile.service';

@Component({
  selector: 'user-details',
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.scss'
})
export class UserDetailsComponent implements OnInit {
  user$!: Observable<User | null>;
  badges$!: Observable<Badge[]>;
  selectedBadge: Badge | null = null; // Store the clicked badge for modal view

  userForm: FormGroup = new FormGroup({
    username: new FormControl(null, Validators.required),
    email: new FormControl(null, [Validators.email, Validators.required]),
    password: new FormControl(null),
    first_name: new FormControl(null, Validators.required),
    last_name: new FormControl(null, Validators.required),
    profile_picture: new FormControl(null, Validators.min(6)),
    address: new FormControl(null),
  });

  constructor(
    private authService: AuthService,
    private modalService: NgbModal,
    private profileService: ProfileService
  ) { 
    this.user$ = this.authService.user$;
    this.badges$ = this.profileService.badges$;
    this.patch();
  }

  get profile_picture() {
    return this.userForm.get('profile_picture')?.value;
  }

  get first_name() {
    return this.userForm.get('first_name')?.value;
  }

  get last_name() {
    return this.userForm.get('last_name')?.value;
  }

  get address() {
    return this.userForm.get('address')?.value;
  }

  ngOnInit(): void {
    this.profileService.achievements().subscribe();
    this.userForm.controls['username'].disable();
    this.userForm.controls['email'].disable();  
  }

  view(template: TemplateRef<any>, size: string = 'xl') {
    const modal = this.modalService.open(template, { size: size, backdrop: 'static' });
    modal.result.then(
      (result) => {},
      () => {}
    );
  }

  update() {
    const formValue = this.userForm.value;
    const cleanedValue = Object.fromEntries(
      Object.entries(formValue).filter(([key, value]) => value !== null && value !== '')
    );
    this.profileService.update(cleanedValue).subscribe();
    this.patch();
  }

  patch() {
    this.user$.subscribe(user => {
      if (user) {
        this.userForm.patchValue({
          username: user.username,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          address: user.address,
          profile_picture: user.profile_picture
        });
      }
    });
  }

  /**
   * Opens the modal to display the clicked badge in a larger view
   */
  openBadgeModal(badge: Badge, modal: TemplateRef<any>) {
    this.selectedBadge = badge;
    this.modalService.open(modal, { size: 'md', centered: true });
  }
}
