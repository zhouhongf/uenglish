import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {MenuController} from '@ionic/angular';
import {MediaMatcher} from '@angular/cdk/layout';
import {BaseService} from '../providers/base.service';


@Component({
  selector: 'app-student',
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.scss'],
})
export class StudentComponent implements OnInit, OnDestroy {
  navigationSubscription;
  mediaQueryList: MediaQueryList;
  private _mediaQueryListener: () => void;
  private _eventType = 'resize';

  avatarDefault = 'assets/images/ionic/ionic-person.svg';
  nickname = '昵称';
  avatar = this.avatarDefault;

  theStudentPages = [
    {title: '学生首页', url: '/student/home'},
    {title: '每日一文', url: '/student/paper'},
    {title: '每日一练', url: '/student/exam'},
  ];

  constructor(
      private baseService: BaseService,
      private changeDetectorRef: ChangeDetectorRef,
      private mediaMatcher: MediaMatcher,
      private router: Router,
      private menu: MenuController,
  ) {
    this.navigationSubscription = this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        const url = event.url;
        if (url === '/student/home' || url === '/student' || url === '/') {
          this.getData();
        }
      }
    });
  }

  ngOnInit() {
    this.setMobileQuery();
  }

  setMobileQuery() {
    this.mediaQueryList = this.mediaMatcher.matchMedia('(min-width: 3600px)');
    this._mediaQueryListener = () => this.changeDetectorRef.detectChanges();
    this.mediaQueryList.addEventListener(this._eventType, this._mediaQueryListener);
  }

  ngOnDestroy() {
    this.mediaQueryList.removeEventListener(this._eventType, this._mediaQueryListener);
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

  getData() {
    const currentUser = this.baseService.getCurrentUser();
    if (currentUser) {
      if (currentUser.nickname) {
        this.nickname = this.baseService.cDecrypt(currentUser.nickname);
      }
      if (currentUser.avatar) {
        this.avatar = currentUser.avatar;
      }
    }

  }

  logout() {
    this.menu.close('mains');
    this.nickname = '昵称';
    this.avatar = this.avatarDefault;
    this.baseService.logout();
  }

  goToPage(page) {
    const commands = page.target ? [page.url, {target: page.target}] : [page.url];
    return this.router.navigate(commands).then(() => {
      this.menu.close('mains');
    });
  }
}
