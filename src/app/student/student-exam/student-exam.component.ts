import { Component, OnInit } from '@angular/core';
import {APIService} from '../../providers/api.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {BaseService} from '../../providers/base.service';
import {timeRange, questionTypeList} from '../../models/student';
import {LocalDBService} from '../../providers/local-db.service';

@Component({
  selector: 'app-student-exam',
  templateUrl: './student-exam.component.html',
  styleUrls: ['./student-exam.component.scss'],
})
export class StudentExamComponent implements OnInit {
  minDate = new Date('2019-01-01 00:00:00');
  maxDate = new Date();

  timeRanges = timeRange;
  timeRangeSelect;

  selectTimeRange = false;
  target: string;

  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  questionTypeList = questionTypeList;

  examMaterial;

  constructor(private formBuilder: FormBuilder, private router: Router, private baseService: BaseService, private localDBService: LocalDBService) {
  }

  ngOnInit() {
    this.createFrom();
  }

  createFrom() {
    this.firstFormGroup = new FormGroup({
      timeRangeSelectTemp: new FormControl('', [Validators.required]),
      timeRangeStart: new FormControl('', [Validators.required]),
      timeRangeEnd: new FormControl('', {validators: Validators.required, updateOn: 'blur'})
    }, timeRangeValidator);
    function timeRangeValidator(g: FormGroup) {
      const timeStart = g.get('timeRangeStart').value;
      const timeEnd = g.get('timeRangeEnd').value;
      if (timeStart == null || timeEnd == null) {
        return {misrange : true};
      }
      if (timeEnd < timeStart) {
        return {misrange : true};
      }
      return null;
    }

    this.secondFormGroup = this.formBuilder.group({
      questionTypes: ['', Validators.required]
    });
  }

  get timeRangeSelectTemp() {
    return this.firstFormGroup.get('timeRangeSelectTemp');
  }

  get timeRangeStart() {
    return this.firstFormGroup.get('timeRangeStart');
  }

  get timeRangeEnd() {
    return this.firstFormGroup.get('timeRangeEnd');
  }

  get questionTypes() {
    return this.secondFormGroup.get('questionTypes');
  }


  select(target) {
    this.selectTimeRange = true;
    this.target = target;
  }

  doRadioGroupChange(event) {
    const currentTime = new Date().getTime();
    let startTime;
    switch (this.timeRangeSelectTemp.value) {
      case 7:
        startTime = currentTime - 7 * 24 * 3600 * 1000;
        this.timeRangeStart.patchValue(new Date(startTime));
        this.timeRangeEnd.patchValue(new Date(currentTime));
        break;
      case 30:
        startTime = currentTime - 30 * 24 * 3600 * 1000;
        this.timeRangeStart.patchValue(new Date(startTime));
        this.timeRangeEnd.patchValue(new Date(currentTime));
        break;
      case 90:
        startTime = currentTime - 90 * 24 * 3600 * 1000;
        this.timeRangeStart.patchValue(new Date(startTime));
        this.timeRangeEnd.patchValue(new Date(currentTime));
        break;
      case 180:
        startTime = currentTime - 180 * 24 * 3600 * 1000;
        this.timeRangeStart.patchValue(new Date(startTime));
        this.timeRangeEnd.patchValue(new Date(currentTime));
        break;
    }
  }

  // 步进器到最后时，从服务器获取考试内容
  doStepperChange(event) {
    if (event.selectedIndex === 2) {
      this.timeRangeSelect = {
        timeStart: new Date(this.timeRangeStart.value).getTime(),
        timeEnd: new Date(this.timeRangeEnd.value).getTime()
      };
      const currentUser = this.baseService.getCurrentUser();
      if (currentUser) {
        this.localDBService.getExamRange(currentUser.username, this.timeRangeSelect.timeStart, this.timeRangeSelect.timeEnd).then(data => {
          if (data) {
            console.log('返回内容是：', data);
            this.examMaterial = data;
          } else {
            console.log('该时间范围内没有数据');
          }
        })
      }
    }
  }

  goToExam() {
    const paperIds = [];
    for (const one of this.examMaterial) {
      paperIds.push(one.id);
    }
    const currentExamRequirements = {paperIds, questionTypes: this.questionTypes.value};
    localStorage.setItem(APIService.SAVE_LOCAL.currentExamRequirements, JSON.stringify(currentExamRequirements));
    return this.router.navigate(['/student/exam' + this.target]);
  }



}
