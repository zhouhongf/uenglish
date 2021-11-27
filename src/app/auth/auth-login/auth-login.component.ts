import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {APIService} from '../../providers/api.service';
import {BaseService} from '../../providers/base.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-auth-login',
  templateUrl: './auth-login.component.html',
  styleUrls: ['./auth-login.component.scss'],
})
export class AuthLoginComponent implements OnInit {
  isMobile: boolean;
  loginForm: FormGroup;

  constructor(private baseService: BaseService, private formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router) {
    this.isMobile = this.baseService.isMobile();
  }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.pattern(APIService.usernamePattern)]],
      password: ['', [Validators.required, Validators.pattern(APIService.passwordPattern)]],
    });
  }

  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }

  login() {
    this.baseService.login(this.username.value.trim(), this.password.value.trim()).then(result => {
      if (result) {
        if (this.isMobile) {
          return this.router.navigate(['/'])
        } else {
          return this.router.navigate(['/'])
          // window.location.replace('http://localhost:8100');
        }
      } else {
        this.baseService.presentToast('登录失败');
      }
    });
    this.loginForm.reset();
  }

}
