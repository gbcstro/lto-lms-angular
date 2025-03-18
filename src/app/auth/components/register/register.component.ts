import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  userForm: FormGroup = new FormGroup({
    username: new FormControl(null, Validators.required),
    email: new FormControl(null, [Validators.required, Validators.email]),
    first_name: new FormControl(null, Validators.required),
    last_name: new FormControl(null, Validators.required),
    password: new FormControl(null, Validators.required)
  });

  invalidLogin: boolean = false;
  errorMessage: string = 'Invalid Registration.';

  constructor(
    private _authService: AuthService
  ) { }

  submit() {
    this._authService.register(this.userForm.value).subscribe();
  }
}