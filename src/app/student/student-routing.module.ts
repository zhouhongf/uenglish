import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {StudentComponent} from './student.component';
import {StudentHomeComponent} from './student-home/student-home.component';
import {StudentPaperComponent} from './student-paper/student-paper.component';
import {StudentPaperDetailComponent} from './student-paper-detail/student-paper-detail.component';
import {StudentExamComponent} from './student-exam/student-exam.component';
import {StudentExamEnglishComponent} from './student-exam-english/student-exam-english.component';
import {StudentExamDetailComponent} from './student-exam-detail/student-exam-detail.component';
import {AuthGuard} from '../utils/auth.guard';


const studentRoutes: Routes = [{
    path: '', component: StudentComponent,
    children: [
        {
            path: '', canActivateChild: [AuthGuard],
            children: [
                {path: 'home', component: StudentHomeComponent},
                {path: '', redirectTo: 'home', pathMatch: 'full'},
                {path: 'paper', component: StudentPaperComponent},
                {path: 'paperDetail', component: StudentPaperDetailComponent},
                {path: 'exam', component: StudentExamComponent},
                {path: 'examEnglish', component: StudentExamEnglishComponent},
                {path: 'examDetail', component: StudentExamDetailComponent}
            ]
        }
    ]
}];

@NgModule({
    imports: [RouterModule.forChild(studentRoutes)],
    exports: [RouterModule]
})
export class StudentRoutingModule {
}
