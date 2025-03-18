import { Component, OnInit } from '@angular/core'; 
import { Observable } from 'rxjs';
import { AuthService } from '../../../auth/services/auth.service';
import { User } from '../../../interfaces/user';

@Component({
  selector: 'nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {
  user$!: Observable<User | null>;
  user: User | null = null;

  constructor(private authService: AuthService) { 
    this.user$ = this.authService.user$;
  }

  ngOnInit(): void {
    // Subscribe to the user observable and assign the value to `user`
    this.user$.subscribe(user => {
      this.user = user;
    });
  }
}
