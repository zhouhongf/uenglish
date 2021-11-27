import {Component, OnInit} from '@angular/core';
import {APIService} from '../../providers/api.service';
import {BaseService} from '../../providers/base.service';
import {AlertController} from '@ionic/angular';
import {Router} from '@angular/router';
import {lessonTypeData} from '../../models/student';
import {LocalDBService} from '../../providers/local-db.service';

@Component({
  selector: 'app-student-paper',
  templateUrl: './student-paper.component.html',
  styleUrls: ['./student-paper.component.scss'],
})
export class StudentPaperComponent implements OnInit{
  writingTypeData = lessonTypeData;
  showDetail = false;
  toDelete = false;

  writingType: string;
  currentUrl = '/student/paper';

  startNumber = 0;
  totalNumber = 0;
  pageSize = APIService.pageSize;
  pageIndex = 1;
  dataShow = [];

  currentUsername;

  constructor(private baseService: BaseService, private localDBService: LocalDBService, private alertController: AlertController, private router: Router) {
  }

  ngOnInit() {
    const currentUser = this.baseService.getCurrentUser();
    if (currentUser) {
      this.currentUsername = currentUser.username;
    }
  }

  getList(value) {
    this.writingType = value;
    this.getData();
  }

  getData() {
    this.localDBService.getPaperList(this.currentUsername, this.writingType, this.startNumber, this.pageSize).then(data => {
      if (data) {
        console.log('返回数据：', data);
        this.totalNumber = data.total;
        this.dataShow = data.data;
      } else {
        console.log('未能获取到数据');
      }
      this.showDetail = true;
    });
  }


  doPage() {
    if (this.totalNumber > this.pageSize) {
      this.pageIndex += 1;
      this.startNumber = this.startNumber + this.dataShow.length;
      this.getData();
    }
  }

  doPageNext() {
    if (this.totalNumber > this.pageSize * 2) {
      this.pageIndex += 1;
      this.startNumber = this.startNumber + this.dataShow.length;
      this.getData();
    }
  }

  doPagePrevious() {
    if (this.pageIndex > 1) {
      this.pageIndex -= 1;
    }
    if (this.totalNumber > this.pageSize) {
      this.startNumber = this.startNumber - this.dataShow.length;
      this.getData();
    }
  }


  create() {
    return this.router.navigate(['/student/paperDetail', {type: this.writingType, backUrl: this.currentUrl}]).then(() => {
      this.showDetail = false;
      this.toDelete = false;
    });
  }

  choose(data) {
    if (this.toDelete) {
      this.del(data);
    } else {
      this.look(data);
    }
  }

  look(data) {
    return this.router.navigate(['/student/paperDetail', {id: data.id, type: this.writingType, backUrl: this.currentUrl}]).then(() => {
      this.showDetail = false;
    });
  }

  async del(data) {
    const alertMessage = '<br>' +
        '<div>标题：<strong>' + data.titleChinese + '</strong></div>\n' +
        '<br>';

    const alert = await this.alertController.create({
      header: '删除以下文章：',
      message: alertMessage,
      buttons: [
        {
          text: '确定',
          cssClass: 'btn btn-danger',
          handler: () => {
            this.doDelete(data.id);
          }
        },
        {
          text: '取消',
          role: 'cancel',
        }
      ]
    });
    await alert.present();
  }

  doDelete(id) {
    this.localDBService.delPaperEnglish(id).then(result => {
      if (result) {
        for (let i = 0; i < this.dataShow.length; i++) {
          const value = this.dataShow[i];
          if (value.id === id) {
            this.dataShow.splice(i, 1);
          }
        }
      } else {
        this.baseService.presentToast('未能删除数据');
      }
    });
  }

}

