import {Component, OnDestroy, OnInit} from '@angular/core';
import {BaseService} from '../../providers/base.service';
import {LocalDBService} from '../../providers/local-db.service';

@Component({
  selector: 'app-student-home',
  templateUrl: './student-home.component.html',
  styleUrls: ['./student-home.component.scss'],
})
export class StudentHomeComponent implements OnInit, OnDestroy {

  paperCount = 0;
  paperTitles;
  lastFiveExamJournal;
  examJournalSummary;
  worker;

  constructor(private baseService: BaseService, private localDBService: LocalDBService) {
  }

  ngOnInit() {
    const currentUser = this.baseService.getCurrentUser();
    if (currentUser) {
      this.getPaperSummary(currentUser.username);
      this.getExamJournalSummary(currentUser.username);
    }
  }

  ngOnDestroy() {
    if (this.worker) {
      this.worker.terminate();
    }
  }

  getPaperSummary(username: string) {
    this.localDBService.getPaperSummary(username).then(data => {
      if (data) {
        this.paperCount = data.paperCount;
        this.paperTitles = data.paperTitles;
      }
    })
  }

  getExamJournalSummary(username: string) {
    this.localDBService.getExamJournalSummary(username).then(data => {
      if (data && data.length > 0) {
        if (data.length < 6) {
          this.lastFiveExamJournal = data;
        } else {
          const startNumber = data.length - 5;
          this.lastFiveExamJournal = data.slice(startNumber);
        }
        if (typeof Worker !== 'undefined') {
          this.worker = new Worker('./student-home.worker', { type: 'module' });
          this.worker.onmessage = (dataOut) => {
            this.examJournalSummary = dataOut.data;
          };
          const dataIn = data;
          this.worker.postMessage(dataIn);
        } else {
          console.log('webworker不能运行，需要自行计算')
        }

      }
    })
  }

}
