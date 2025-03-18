import { Component, OnInit } from '@angular/core';
import { User } from '../../../interfaces/user';
import { Observable, tap } from 'rxjs';
import { AdminService } from './services/admin.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ViewModalComponent } from './components/view-modal/view-modal.component';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  users$!: Observable<User[]>; 
  user$!: Observable<User | null>;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  allUsers: User[] = [];
  pagedUsers: User[] = [];
  totalPages: number = 1;
  pages: number[] = [];

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    console.log('Fetching users...');
    
    this.users$ = this.adminService.users$.pipe(
      tap((users) => {
        console.log('Users fetched:', users);
        if (users && users.length > 0) {
          this.allUsers = users;
          this.updatePagination();
        } else {
          console.warn('No users found!');
        }
      })
    );

    this.user$ = this.authService.user$;
    
    // Manually trigger the user fetch in case it is not loading
    this.adminService.index().subscribe(users => {
      if (users.length > 0) {
        this.allUsers = users;
        console.log('Users assigned from index():', users);
        this.updatePagination();
      } else {
        console.warn('No users received from API.');
      }
    });
  }

  view(user: User) {
    const modalRef = this.modalService.open(ViewModalComponent, { size: 'xl' });
    modalRef.componentInstance.user = user;
    modalRef.result.then(() => {}, () => {});
  }

  delete(user: User) {
    const confirmDelete = window.confirm(`Are you sure you want to delete ${user.first_name} ${user.last_name}?`);
  
    if (confirmDelete) {
      this.adminService.delete(user.id).subscribe(() => {
        console.log('Deleted user:', user.id);
        this.allUsers = this.allUsers.filter(u => u.id !== user.id);
        this.updatePagination();
      });
    }
  }
  

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      console.log('Changing to page:', page);
      this.currentPage = page;
      this.updatePagination();
    }
  }

  updatePagination() {
    console.log('Updating pagination...');
    
    if (this.allUsers.length === 0) {
      console.warn('No users available for pagination.');
      return;
    }

    this.totalPages = Math.ceil(this.allUsers.length / this.itemsPerPage);
    this.currentPage = Math.min(this.currentPage, this.totalPages);
    
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.pagedUsers = this.allUsers.slice(startIndex, endIndex);

    console.log('Paged Users:', this.pagedUsers);
    
    this.updatePages();
  }

  updatePages() {
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}
