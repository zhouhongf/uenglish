import {Injectable} from '@angular/core';
import {AlertController, LoadingController, Platform, ToastController} from '@ionic/angular';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {APIService} from './api.service';
import {Storage} from '@ionic/storage';
import {Camera, CameraOptions} from '@ionic-native/camera/ngx';
import {Observable} from 'rxjs';
import {SysUserInterface} from '../models/student';
import {Router} from '@angular/router';
import * as CryptoJS from 'crypto-js';


@Injectable({
    providedIn: 'root'
})
export class BaseService {

    theDomain = APIService.domain;
    cKey = CryptoJS.enc.Utf8.parse('uenglishckey0123');     // 必须为十六位
    cIV = CryptoJS.enc.Utf8.parse('ckey0123uenglish');      // 必须为十六位

    constructor(
        private platform: Platform,
        private http: HttpClient,
        private loadingCtrl: LoadingController,
        private alertCtrl: AlertController,
        private toastCtrl: ToastController,
        private storage: Storage,
        private camera: Camera,
        private router: Router
    ) {
    }

    isMobile(): boolean {
        const deviceType = localStorage.getItem(APIService.SAVE_LOCAL.deviceType);
        if (deviceType) {
            return deviceType === APIService.mobile;
        } else {
            return this.platform.is('mobile');
        }
    }

    cEncrypt(data: string): string {
        const srcs = CryptoJS.enc.Utf8.parse(data);
        const encrypted = CryptoJS.AES.encrypt(srcs, this.cKey, {iv: this.cIV, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7});
        return encrypted.ciphertext.toString().toUpperCase();
    }

    cDecrypt(data: string): string {
        const encryptedHexStr = CryptoJS.enc.Hex.parse(data);
        const srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
        const decrypted = CryptoJS.AES.decrypt(srcs, this.cKey, {iv: this.cIV, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7});
        return CryptoJS.enc.Utf8.stringify(decrypted).toString();
    }

    register(username: string, password: string) : Promise<boolean> {
        const codedUsername = this.cEncrypt(username);
        const codedPassword = this.cEncrypt(password);
        const sysUser: SysUserInterface = {username: codedUsername, password: codedPassword, updateTime: Date.now(), nickname: '', avatar: ''};
        return this.storage.get(APIService.SAVE_STORAGE.sysuser).then(data => {
           if (data && data.length > 0) {
               const dataList: Array<any> = data;
               for (const one of dataList) {
                   const usernameSave = one.username;
                   if(usernameSave === codedUsername) {
                       return false;
                   }
               }
               dataList.push(sysUser);
               this.storage.set(APIService.SAVE_STORAGE.sysuser, dataList);
               return true;
           } else {
               const dataList = [sysUser];
               this.storage.set(APIService.SAVE_STORAGE.sysuser, dataList);
               return true;
           }
        });
    }

    login(username: string, password: string) : Promise<boolean>{
        const codedUsername = this.cEncrypt(username);
        const codedPassword = this.cEncrypt(password);
        return this.storage.get(APIService.SAVE_STORAGE.sysuser).then(data => {
            if (data && data.length > 0) {
                const dataList: Array<any> = data;
                for (const one of dataList) {
                    const usernameSave = one.username;
                    const passwordSave = one.password;
                    if(usernameSave === codedUsername && passwordSave === codedPassword) {
                        const currentUser = {username, expireTime: Date.now() + APIService.tokenValidTime, nickname: one.nickname, avatar: one.avatar};
                        this.setCurrentUser(currentUser);
                        return true;
                    }
                }
            }
            return false;
        });
    }

    logout() {
        return this.router.navigate(['/auth/login']).then(() => {
            localStorage.removeItem(APIService.SAVE_LOCAL.currentUser);
        })
    }

    changePassword(passwordOld: string, passwordNew: string): Promise<boolean> {
        const passwordOldEncode = this.cEncrypt(passwordOld);
        const passwordNewEncode = this.cEncrypt(passwordNew);
        const currentUser = this.getCurrentUser();
        return this.storage.get(APIService.SAVE_STORAGE.sysuser).then(data => {
            if (currentUser == null) {
                return false;
            }
            const usernameEncode = this.cEncrypt(currentUser.username);
            if (data && data.length > 0) {
                for (let i=0; i < data.length; i++) {
                    const one = data[i];
                    if(one.username === usernameEncode) {
                        if (one.password !== passwordOldEncode) {
                            return false;
                        }
                        const sysUser: SysUserInterface = {username: one.username, password: passwordNewEncode, updateTime: Date.now(), nickname: one.nickname, avatar: one.avatar};
                        data.splice(i, 1, sysUser);
                        this.storage.set(APIService.SAVE_STORAGE.sysuser, data);
                        return true;
                    }
                }
            }
            return false;
        })
    }

    isLogin(): boolean {
        const currentUser = this.getCurrentUser();
        if (currentUser) {
            console.log('currentUser是：', currentUser);
            const deadline = currentUser.expireTime;
            if (deadline != null) {
                const currentTime = Date.now();
                const diffTime = deadline - currentTime;
                if (diffTime > 0) {
                    if (diffTime < APIService.tokenGraceTime) {
                        currentUser.expireTime = currentTime + APIService.tokenValidTime;
                        this.setCurrentUser(currentUser);
                    }
                    return true;
                }
            }
        }
        return false;
    }

    setCurrentUser(currentUser) {
        const currentUserStr = JSON.stringify(currentUser);
        localStorage.setItem(APIService.SAVE_LOCAL.currentUser, currentUserStr);
    }

    getCurrentUser() {
        const currentUserStr = localStorage.getItem(APIService.SAVE_LOCAL.currentUser);
        return currentUserStr ? JSON.parse(currentUserStr) : null;
    }

    setAvatar(avatar: string) : Promise<boolean> {
        const currentUser = this.getCurrentUser();
        return this.storage.get(APIService.SAVE_STORAGE.sysuser).then(data => {
            if (currentUser == null) {
                return false;
            }
            const usernameEncode = this.cEncrypt(currentUser.username);
            if (data && data.length > 0) {
                for (let i=0; i < data.length; i++) {
                    const one = data[i];
                    if(one.username === usernameEncode) {
                        const sysUser: SysUserInterface = {username: one.username, password: one.password, updateTime: Date.now(), nickname: one.nickname, avatar};
                        data.splice(i, 1, sysUser);
                        this.storage.set(APIService.SAVE_STORAGE.sysuser, data);
                        currentUser.avatar = avatar;
                        this.setCurrentUser(currentUser);
                        return true;
                    }
                }
            }
            return false;
        })
    }

    setNickname(nickname: string) : Promise<boolean> {
        const currentUser = this.getCurrentUser();
        return this.storage.get(APIService.SAVE_STORAGE.sysuser).then(data => {
            if (currentUser == null) {
                return false;
            }
            const usernameEncode = this.cEncrypt(currentUser.username);
            if (data && data.length > 0) {
                for (let i=0; i < data.length; i++) {
                    const one = data[i];
                    if(one.username === usernameEncode) {
                        const nicknameEncode = this.cEncrypt(nickname);
                        const sysUser: SysUserInterface = {username: one.username, password: one.password, updateTime: Date.now(), nickname: nicknameEncode, avatar: one.avatar};
                        data.splice(i, 1, sysUser);
                        this.storage.set(APIService.SAVE_STORAGE.sysuser, data);
                        currentUser.nickname = nicknameEncode;
                        this.setCurrentUser(currentUser);
                        return true;
                    }
                }
            }
            return false;
        })
    }


    // 对参数进行编码
    encode(params) {
        let str = '';
        if (params) {
            for (const key in params) {
                if (params.hasOwnProperty(key)) {
                    const value = params[key];
                    str += encodeURIComponent(key) + '=' + encodeURIComponent(value) + '&';
                }
            }
            str = '?' + str.substring(0, str.length - 1);
        }
        return str;
    }

    async httpGet(url, params, callback?, loader: boolean = false) {
        const loading = await this.loadingCtrl.create({});
        if (loader) {
            await loading.present();
        }
        this.http.get(this.theDomain + url + this.encode(params)).subscribe(
            async data => {
                if (loader) {
                    await loading.dismiss();
                }
                callback(data == null || data['code'] === 9 ? '[]' : data);
            },
            async error => {
                if (loader) {
                    await loading.dismiss();
                }
                this.handleError(error);
            });
    }

    async httpPost(url, params, body, callback?, loader: boolean = false) {
        const loading = await this.loadingCtrl.create();
        if (loader) {
            await loading.present();
        }
        this.http.post(this.theDomain + url + this.encode(params), body).subscribe(
            async data => {
                if (loader) {
                    await loading.dismiss();
                }
                callback(data == null || data['code'] === 9 ? '[]' : data);
            },
            async error => {
                if (loader) {
                    await loading.dismiss();
                }
                this.handleError(error);
            });
    }


    async httpDelete(url, params, callback?, loader: boolean = false) {
        const loading = await this.loadingCtrl.create({});
        if (loader) {
            await loading.present();
        }
        this.http.delete(this.theDomain + url + this.encode(params)).subscribe(
            async data => {
                if (loader) {
                    await loading.dismiss();
                }
                callback(data == null || data['code'] === 9 ? '[]' : data);
            },
            async error => {
                if (loader) {
                    await loading.dismiss();
                }
                this.handleError(error);
            });
    }


    handleError(error: Response | any) {
        let msg = '';
        if (error.status === 400) {
            msg = '请求无效(code：404)';
            console.log('请检查参数类型是否匹配');
        }
        if (error.status === 404) {
            msg = '请求资源不存在(code：404)';
            console.error(msg + '，请检查路径是否正确');
        }
        if (error.status === 500) {
            msg = '服务器发生错误(code：500)';
            console.error(msg + '，请检查路径是否正确');
        }
        console.log(error);
        if (msg !== '') {
            this.presentToast(msg);
        }
    }

    async alert(message, callback?) {
        if (callback) {
            const alert = await this.alertCtrl.create({
                header: '提示',
                message,
                buttons: [{
                    text: '确定', handler: data => {
                        callback();
                    }
                }]
            });
            await alert.present();
        } else {
            const alert = await this.alertCtrl.create({
                header: '提示',
                message,
                buttons: ['确定']
            });
            await alert.present();
        }
    }

    async presentToast(message: string) {
        const toast = await this.toastCtrl.create({message, duration: 3000});
        toast.present().then(value => {
            return value;
        });
    }

    /**
     * 使用camera拍照或打开媒体相册
     */
    getPicture(options: CameraOptions = {}): Observable<any> {
        return new Observable(observer => {
            const ops: CameraOptions = {
                // sourceType: this.camera.PictureSourceType.CAMERA, // 图片来源,CAMERA:1,拍照,PHOTOLIBRARY:2,相册
                // destinationType: this.camera.DestinationType.DATA_URL,
                // quality: 100,        // 图像质量，范围为0 - 100
                // targetWidth: 150,    // 缩放图像的宽度（像素）
                // targetHeight: 150,   // 缩放图像的高度（像素）
                mediaType: this.camera.MediaType.PICTURE,
                allowEdit: true,        // 选择图片前是否允许编辑
                encodingType: this.camera.EncodingType.JPEG,
                saveToPhotoAlbum: true, // 是否保存到相册
                correctOrientation: true,
                ...options
            };
            this.camera.getPicture(ops).then(image => {
                if (ops.destinationType === this.camera.DestinationType.DATA_URL) {
                    observer.next('data:image/jpeg;base64,' + image);
                } else {
                    const filePath = image.slice(7);
                    observer.next(filePath);
                }
            }, error => {
                console.log('Error: ' + error);
                observer.error(false);
            }).catch(
                err => {
                    if (err === 20) {
                        alert('没有权限,请在设置中开启权限');
                    } else if (String(err).indexOf('cancel') !== -1) {
                        console.log('用户点击了取消按钮');
                    } else {
                        console.log(err, '使用cordova-plugin-camera获取照片失败');
                        alert('获取照片失败');
                    }
                    observer.error(false);
                });
        });
    }
}
