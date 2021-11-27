import { Component, OnInit } from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {BaseService} from '../../providers/base.service';
import {Router} from '@angular/router';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import {ActionSheetController} from '@ionic/angular';
import {PreviewimgService} from '../../providers/previewimg.service';
import {APIService} from '../../providers/api.service';

@Component({
  selector: 'app-sysuser-home',
  templateUrl: './sysuser-home.component.html',
  styleUrls: ['./sysuser-home.component.scss'],
})
export class SysuserHomeComponent implements OnInit {
  isMobile;
  userAvatar: string;
  showNickname = false;
  nickname = new FormControl('', [Validators.required, Validators.pattern(APIService.nicknamePattern)]);

  constructor(
      private baseService: BaseService,
      private previewimgService: PreviewimgService,
      private router: Router,
      private camera: Camera,
      private actionSheetCtrl: ActionSheetController
  ) {
  }

  ngOnInit() {
    this.isMobile = this.baseService.isMobile();
  }

  goBack() {
    if (this.showNickname) {
      this.showNickname = false;
      return
    }
    return this.router.navigate(['/']);
  }

  updateUserAvatar() {
    if (this.isMobile) {
      this.openFileMobile();
    } else {
      this.openFileBrowse();
    }
  }

  openFileBrowse() {
    const inputObj = document.createElement('input');
    inputObj.setAttribute('id', '_ef');
    inputObj.setAttribute('type', 'file');
    inputObj.setAttribute('style', 'visibility:hidden');
    // inputObj.setAttribute('accept', 'image/jpeg,image/png,application/pdf,text/plain');
    // inputObj.setAttribute('directory', '');
    document.body.appendChild(inputObj);
    inputObj.addEventListener('change', event => {
      const files = event.target['files'];
      if (files.length === 1) {
        // const path = event['path'][0];
        // const filePath = path['value'];
        const file = files[0];
        const fileType = file.type;
        if (fileType === 'image/jpeg' || fileType === 'image/png') {
          this.previewimgService.readAsDataUrlWithCompress(file, 200).then(data => {
            console.log('转换成base64的数据为：', data);
            this.userAvatar = data.toString();
            this.uploadPhotoBase64(this.userAvatar);
          });

        } else {
          this.baseService.presentToast('只能上传jpeg, jpg, png类型的图片');
        }
      }
    });
    inputObj.click();                           // 模拟点击
    document.body.removeChild(inputObj);        // 从DOM中移除input
  }

  async openFileMobile() {
    const options: CameraOptions = {
      destinationType: this.camera.DestinationType.DATA_URL,
      quality: 100,
      targetWidth: 150,
      targetHeight: 150,
    };
    const actionSheet = await this.actionSheetCtrl.create({
      buttons: [
        {
          text: '拍照',
          handler: () => {
            options.sourceType = this.camera.PictureSourceType.CAMERA;
            this.baseService.getPicture(options).subscribe(data => {
              this.userAvatar = data;
              this.uploadPhotoBase64(this.userAvatar);
            });
          }
        },
        {
          text: '相册',
          handler: () => {
            options.sourceType = this.camera.PictureSourceType.PHOTOLIBRARY;
            this.baseService.getPicture(options).subscribe(data => {
              this.userAvatar = data;
              this.uploadPhotoBase64(this.userAvatar);
            });
          }
        },
        {
          text: '取消',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  uploadPhotoBase64(base64Str: string) {
    this.baseService.setAvatar(base64Str).then(result => {
      if (result) {
        this.goBack();
      } else {
        this.baseService.presentToast('设置头像错误');
      }
    });
  }

  saveNickname() {
    const nickname = this.nickname.value.trim();
    this.baseService.setNickname(nickname).then(result => {
      if (result) {
        this.showNickname = false;
        this.nickname.reset();
      } else {
        this.baseService.presentToast('设置昵称错误');
      }
    });
  }

}
