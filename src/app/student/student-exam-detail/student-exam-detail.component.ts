import {Component, OnInit} from '@angular/core';
import {APIService} from '../../providers/api.service';
import {ExamJournalInterface} from '../../models/student';
import {BaseService} from '../../providers/base.service';
import {ActivatedRoute, Router} from '@angular/router';
import {LocalDBService} from '../../providers/local-db.service';
import {TextToSpeech} from '@ionic-native/text-to-speech/ngx';

@Component({
  selector: 'app-student-exam-detail',
  templateUrl: './student-exam-detail.component.html',
  styleUrls: ['./student-exam-detail.component.scss'],
})
export class StudentExamDetailComponent implements OnInit {
  backUrl;

  timeStart;
  timeEnd;    // 考试预定结束时间
  timeOver;   // 考试真正结束时间

  examType;
  examSectionData;

  timePerQuestion = 60000;   // 单位：1分钟
  timeUp = false;

  examScore;
  showCorrectAnswer = false;
  answerSheetList = [];

  questionNumber = 0;     // 仅用于统计 单词填空题 的数量

  audioVolumeOff = 'fa fa-volume-off';
  audioVolumeUp = 'fa fa-volume-up';

  constructor(
      private baseService: BaseService,
      private localDBService: LocalDBService,
      private route: ActivatedRoute,
      private router: Router,
      private tts: TextToSpeech
  ) {
  }

  ngOnInit() {
    this.getRouteParams();
  }

  getRouteParams() {
    this.route.paramMap.subscribe(data => {
      this.examType = data.get('examType');
      this.timeStart = data.get('examTime');
      this.backUrl = data.get('backUrl');
      this.getData();
    });
  }

  getData() {
    let storageKey;
    if (this.backUrl.endsWith('English')) {
      storageKey = APIService.SAVE_STORAGE.examEnglish;
    }
    this.localDBService.getStorageData(storageKey).then(data => {
      if (data) {
        for (const one of data) {
          if (this.examType === one.examType) {
            this.examSectionData = one.examSectionData;
            break;
          }
        }
        if (this.examType === '单词填空题') {
          this.questionNumber = 0;
          for (const one of this.examSectionData) {
            const items = one.items;
            this.questionNumber = this.questionNumber + items.length;
          }
          this.questionNumber = this.questionNumber - this.examSectionData.length;        // 因为每篇文章最后一句话后面的input不需要填东西，所以按照文章总数，各减去1

          this.timeEnd = Number(this.timeStart) + this.questionNumber * this.timePerQuestion;
        } else {
          this.timeEnd = Number(this.timeStart) + this.examSectionData.length * this.timePerQuestion;
        }
      }
    });
  }

  loadVoice(num, word) {
    const id = 'voice-' + num;
    const soundDom = document.getElementById(id);
    soundDom.removeAttribute('class');
    soundDom.setAttribute('class', this.audioVolumeUp);
    this.tts.speak({text: word, locale: 'en-US', rate: 0.75})
        .then(() => console.log('Success'))
        .catch((reason: any) => console.log(reason));

    setTimeout(() => {
      soundDom.removeAttribute('class');
      soundDom.setAttribute('class', this.audioVolumeOff);
    }, 2000);
  }


  doRadioGroupChange(event, question) {
    const answer = event.value;
    const data = {question, answer};
    for (let i = 0; i < this.answerSheetList.length; i++) {
      const one = this.answerSheetList[i];
      if (question === one.question) {
        this.answerSheetList.splice(i, 1);
        break;
      }
    }
    this.answerSheetList.push(data);
    console.log('答题卡内容是：', this.answerSheetList);
  }

  doInputChange(num, question) {
    const id = 'input-' + num;
    // @ts-ignore
    const answer = document.getElementById(id).value;
    const data = {question, answer: answer.trim()};
    for (let i = 0; i < this.answerSheetList.length; i++) {
      const one = this.answerSheetList[i];
      if (question === one.question) {
        this.answerSheetList.splice(i, 1);
        break;
      }
    }
    this.answerSheetList.push(data);
    console.log('答题卡内容是：', this.answerSheetList);
  }

  doInputChangeDoubleIndex(i, j) {
    const id = 'input-' + i + '-' + j;
    // @ts-ignore
    const answer = document.getElementById(id).value;
    const data = {id, answer: answer.trim()};
    for (let n = 0; n < this.answerSheetList.length; n++) {
      const one = this.answerSheetList[n];
      if (id === one.id) {
        this.answerSheetList.splice(n, 1);
        break;
      }
    }
    this.answerSheetList.push(data);
    console.log('答题卡内容是：', this.answerSheetList);
  }


  doTimeUp(event) {
    console.log('倒计时时间到了: ', event);
    this.baseService.presentToast('时间到!');
    this.doEndExam();
  }

  doEndExam() {
    this.timeUp = true;
    this.timeOver = new Date().getTime();
    if (this.answerSheetList.length === 0) {
      this.examScore = '考试作废';
      return;
    }
    if (this.examType === '单词填空题') {
      this.checkExamSentenceFixEN();
    } else {
      const answerCorrectList = [];
      for (const one of this.examSectionData) {
        const question = one.question;
        const answerCorrect = one.answerCorrect;
        for (const two of this.answerSheetList) {
          if (question === two.question) {
            if (answerCorrect === two.answer) {
              answerCorrectList.push(question);
            }
            one.answerSelected = two.answer;
            break;
          }
        }
      }
      this.examScore = Math.round(answerCorrectList.length / this.examSectionData.length * 100);
    }
  }

  checkExamSentenceFixEN() {
    const answerCorrectList = [];
    for (const one of this.answerSheetList) {
      const id = one.id;
      const answer = one.answer;
      const idWords = id.split('-');
      const i = idWords[1];
      const j = idWords[2];
      const findI = this.examSectionData[i].items;
      const findJ = findI[j];
      console.log('inputId是：', id);
      console.log('inputAnswer是：', answer);
      console.log('findJ是：', findJ);
      if (answer === findJ.answerCorrect) {
        answerCorrectList.push(id);
      }
    }
    this.examScore = Math.round(answerCorrectList.length / this.questionNumber * 100);
  }

  goBack() {
    if (this.answerSheetList.length > 0) {
      this.doExamJournal();
    }
    return this.router.navigate([this.backUrl]);
  }

  doExamJournal() {
    const questions = [];
    const answersWrong = [];
    if (this.examType === '单词填空题') {
      let contentChineseAll = '';
      for (const one of this.examSectionData) {
        const sentenceList = [];
        const items = one.items;
        for (const two of items) {
          const question = two.question;
          sentenceList.push(question);
        }
        const contentEnglishWithBlank = sentenceList.join('______');
        contentChineseAll = contentChineseAll + '<div>' + contentEnglishWithBlank + '</div><br>';
      }
      questions.push(contentChineseAll.trim());
      answersWrong.push(100 - this.examScore);
    } else {
      for (const one of this.examSectionData) {
        const question = one.question;
        questions.push(question);
        const answerCorrect = one.answerCorrect;
        const answerSelected = one.answerSelected;
        if (answerCorrect !== answerSelected) {
          answersWrong.push(question);
        }
      }
    }

    const examJournal: ExamJournalInterface = {timeStart: Number(this.timeStart), timeEnd: this.timeEnd, timeOver: this.timeOver, examType: this.examType, questions, answersWrong};
    const currentUser = this.baseService.getCurrentUser();
    if (currentUser) {
      this.localDBService.setExamJournal(currentUser.username, this.examScore, examJournal).then(result => {
        if (result) {
          console.log('保存成功');
        }
      })
    }
  }
}
