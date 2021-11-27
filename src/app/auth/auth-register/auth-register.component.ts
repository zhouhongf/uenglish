import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {APIService} from '../../providers/api.service';
import {BaseService} from '../../providers/base.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-auth-register',
  templateUrl: './auth-register.component.html',
  styleUrls: ['./auth-register.component.scss'],
})
export class AuthRegisterComponent implements OnInit {
  isMobile = false;
  registrationForm: FormGroup;
  usernamePattern = APIService.usernamePattern;
  passwordPattern = APIService.passwordPattern;
  isShowPassword = false;

  constructor(private formBuilder: FormBuilder, private baseService: BaseService, private route: ActivatedRoute, private router: Router) {
    this.isMobile = baseService.isMobile();
  }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.registrationForm = this.formBuilder.group({
      username: new FormControl('', [Validators.required, Validators.pattern(this.usernamePattern)]),
      password: new FormControl('', [Validators.required, Validators.pattern(this.passwordPattern)]),
      passwordConfirm: new FormControl('', [Validators.required, Validators.pattern(this.passwordPattern)]),
    });
  }

  get username() {
    return this.registrationForm.get('username');
  }

  get password() {
    return this.registrationForm.get('password');
  }

  get passwordConfirm() {
    return this.registrationForm.get('passwordConfirm');
  }

  showPassword(event) {
    event.preventDefault();
    this.isShowPassword = !this.isShowPassword;
  }

  onSignup() {
    if (this.password.value !== this.passwordConfirm.value) {
      return this.baseService.presentToast('两次输入的密码不一致');
    }
    const theUsername = this.username.value.trim();
    const thePassword = this.password.value.trim();
    this.baseService.register(theUsername, thePassword).then(result => {
      if (result) {
        return this.router.navigate(['/auth/login'])
      } else {
        this.baseService.presentToast('注册失败');
      }
    });
    this.registrationForm.reset();
  }

}
