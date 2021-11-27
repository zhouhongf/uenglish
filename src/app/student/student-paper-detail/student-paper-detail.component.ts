import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {APIService} from '../../providers/api.service';
import {BaseService} from '../../providers/base.service';
import {ActivatedRoute, Router} from '@angular/router';
import {VocabularyInterface} from '../../models/student';
import {LocalDBService} from '../../providers/local-db.service';
import {TextToSpeech} from '@ionic-native/text-to-speech/ngx';


@Component({
  selector: 'app-student-paper-detail',
  templateUrl: './student-paper-detail.component.html',
  styleUrls: ['./student-paper-detail.component.scss'],
})
export class StudentPaperDetailComponent implements OnInit {
  writingId: string;
  writingType: string;
  backUrl: string;
  writingForm: FormGroup;
  fontSize = 18;
  dataShow;

  showSearch = false;
  searchContent = new FormControl('', Validators.required);
  searchResult;

  audioVolumeOff = 'fa fa-volume-off';
  audioVolumeUp = 'fa fa-volume-up';
  audioClass = this.audioVolumeOff;
  audioClassChinese = this.audioVolumeOff;

  constructor(
      private baseService: BaseService,
      private localDBService: LocalDBService,
      private formBuilder: FormBuilder,
      private route: ActivatedRoute,
      private router: Router,
      private tts: TextToSpeech
  ) {
  }

  ngOnInit() {
    this.createForm();
    const currentUser = this.baseService.getCurrentUser();
    this.route.paramMap.subscribe(data => {
      this.writingId = data.get('id');
      this.writingType = data.get('type');
      this.backUrl = data.get('backUrl');
      if (this.writingType) {
        this.type.patchValue(this.writingType);
      }
      if (this.writingId) {
        this.getData();
      } else {
        this.writingId = currentUser.username + '=' + Date.now()
      }
      this.id.patchValue(this.writingId);
    });
  }

  goBack() {
    return this.router.navigate([this.backUrl]);
  }

  smallFont() {
    if (this.fontSize > 10) {
      this.fontSize -= 2;
    }
  }

  largeFont() {
    if (this.fontSize < 60) {
      this.fontSize += 2;
    }
  }

  loadEnglish(data) {
    this.audioClass = this.audioVolumeUp;
    const word = data.name_english;
    this.tts.speak({text: word, locale: 'en-US', rate: 0.75})
        .then(() => console.log('Success'))
        .catch((reason: any) => console.log(reason));

    setTimeout(() => {
      this.audioClass = this.audioVolumeOff;
    }, 2000);
  }

  loadChinese(data) {
    this.audioClassChinese = this.audioVolumeUp;
    const word = data.name_chinese;
    this.tts.speak({text: word, locale: 'zh-CN', rate: 0.75})
        .then(() => console.log('Success'))
        .catch((reason: any) => console.log(reason));

    setTimeout(() => {
      this.audioClassChinese = this.audioVolumeOff;
    }, 2000);
  }

  doSearch() {
    this.searchResult = this.localDBService.getEnglishWord(this.searchContent.value.trim());
  }

  doRefresh(event) {
    this.getData();
    setTimeout(() => {event.target.complete(); }, 2000);
  }

  getData() {
    this.localDBService.getPaperEnglish(this.writingId).then(data => {
      if (data) {
        this.dataShow = data;
        this.resetForm(this.dataShow);
      } else {
        this.baseService.presentToast('未能获取到数据');
      }
    });
  }

  createForm() {
    this.writingForm = this.formBuilder.group({
      id: ['', Validators.required],
      type: ['', Validators.required],
      titleChinese: ['', [Validators.required, Validators.pattern(APIService.ChinesePattern)]],
      authorChinese: ['', [Validators.required, Validators.pattern(APIService.ChinesePattern)]],
      contentChinese: ['', Validators.required],
      titleEnglish: ['', [Validators.required, Validators.pattern(APIService.EnglishPattern)]],
      authorEnglish: ['', [Validators.required, Validators.pattern(APIService.EnglishPattern)]],
      contentEnglish: ['', Validators.required],
      status: '',
      createTime: '',
      vocabularies: this.formBuilder.array([]),
    });
  }

  resetForm(data) {
    this.type.patchValue(data.type);
    this.titleChinese.patchValue(data.titleChinese);
    this.authorChinese.patchValue(data.authorChinese);
    this.contentChinese.patchValue(data.contentChinese);
    this.titleEnglish.patchValue(data.titleEnglish);
    this.authorEnglish.patchValue(data.authorEnglish);
    this.contentEnglish.patchValue(data.contentEnglish);
    this.status.patchValue(data.status);
    this.createTime.patchValue(data.createTime);
    this.setVocabularies(data.vocabularies);
  }

  get id() {
    return this.writingForm.get('id');
  }

  get type() {
    return this.writingForm.get('type');
  }

  get titleChinese() {
    return this.writingForm.get('titleChinese');
  }

  get authorChinese() {
    return this.writingForm.get('authorChinese');
  }

  get contentChinese() {
    return this.writingForm.get('contentChinese');
  }

  get titleEnglish() {
    return this.writingForm.get('titleEnglish');
  }

  get authorEnglish() {
    return this.writingForm.get('authorEnglish');
  }

  get contentEnglish() {
    return this.writingForm.get('contentEnglish');
  }

  get status() {
    return this.writingForm.get('status');
  }

  get createTime() {
    return this.writingForm.get('createTime');
  }

  get vocabularies(): FormArray {
    return this.writingForm.get('vocabularies') as FormArray;
  }

  setVocabularies(vocabularies: VocabularyInterface[]) {
    const vocabularyFGs = vocabularies.map(one => this.formBuilder.group(one));
    const vocabularyFormArray = this.formBuilder.array(vocabularyFGs);
    this.writingForm.setControl('vocabularies', vocabularyFormArray);
  }

  addVocabulary() {
    if (this.vocabularies.length > 20) {
      this.baseService.presentToast('最多添加20个单词');
    } else {
      this.vocabularies.push(this.formBuilder.group({
        englishWord: ['', [Validators.required, Validators.pattern(APIService.EnglishPattern)]],
        chineseWord: ['', [Validators.required, Validators.pattern(APIService.ChinesePattern)]],
      }));
    }
  }

  removeVocabulary(item) {
    this.vocabularies.removeAt(item);
  }

  doSave(canRelease) {
    if (this.dataShow && this.dataShow.status === 'YES') {
      return this.baseService.presentToast('此内容已发布过！');
    }
    this.status.patchValue(canRelease);
    this.createTime.patchValue(Date.now());
    const paperValue = this.writingForm.value;
    this.localDBService.setPaperEnglish(paperValue).then(result => {
      if (result) {
        this.goBack();
      } else {
        this.baseService.presentToast('保存不成功')
      }
    });
  }
}
