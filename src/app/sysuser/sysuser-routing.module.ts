import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SysuserHomeComponent} from './sysuser-home/sysuser-home.component';
import {SysuserComponent} from './sysuser.component';
import {SysuserChangepasswordComponent} from './sysuser-changepassword/sysuser-changepassword.component';


const sysuserRoutes: Routes = [{
    path: '', component: SysuserComponent,
    children: [
        {path: 'home', component: SysuserHomeComponent},
        {path: '', redirectTo: 'home', pathMatch: 'full'},
        {path: 'changePassword', component: SysuserChangepasswordComponent}
    ]
}];

@NgModule({
    imports: [
        RouterModule.forChild(sysuserRoutes)
    ],
    exports: [
        RouterModule
    ]
})
export class SysuserRoutingModule {
}
