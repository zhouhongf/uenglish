import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import {BackgroundMode} from '@ionic-native/background-mode/ngx';
import {AndroidPermissions} from '@ionic-native/android-permissions/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private backgroundMode: BackgroundMode,
    private androidPermissions: AndroidPermissions
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.backgroundMode.enable();
    this.platform.ready().then(() => {
      this.statusBar.overlaysWebView(true);
      this.splashScreen.hide();
      this.requestPermission();
    });
  }

  requestPermission() {
    const isAndroid = this.platform.is('android');
    if (isAndroid === true) {
      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE)
          .then(
              result => {
                if (!result.hasPermission) {
                  this.androidPermissions.requestPermissions([
                    this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE,
                    this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE,
                    this.androidPermissions.PERMISSION.CAMERA
                  ]);
                }
              }, error => {
                alert('鉴权error内容是：' + error.toString());
              }
          ).catch(
          err => alert('需要手动开启权限：' + err.toString())
      );
    }
  }

}
