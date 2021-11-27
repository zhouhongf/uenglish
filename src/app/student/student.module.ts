import { NgModule } from '@angular/core';
import {IonicModule} from '@ionic/angular';
import {ToolModule} from '../tool/tool.module';
import {StudentRoutingModule} from './student-routing.module';
import {StudentComponent} from './student.component';
import {StudentHomeComponent} from './student-home/student-home.component';
import {StudentPaperComponent} from './student-paper/student-paper.component';
import {StudentPaperDetailComponent} from './student-paper-detail/student-paper-detail.component';
import {StudentExamComponent} from './student-exam/student-exam.component';
import {StudentExamEnglishComponent} from './student-exam-english/student-exam-english.component';
import {StudentExamDetailComponent} from './student-exam-detail/student-exam-detail.component';



@NgModule({
  imports: [
    IonicModule,
    ToolModule,
    StudentRoutingModule
  ],
  declarations: [
    StudentComponent,
    StudentHomeComponent,
    StudentPaperComponent,
    StudentPaperDetailComponent,
    StudentExamComponent,
    StudentExamEnglishComponent,
    StudentExamDetailComponent
  ],
})
export class StudentModule { }
