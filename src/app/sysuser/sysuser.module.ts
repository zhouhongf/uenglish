import {NgModule} from '@angular/core';
import {IonicModule} from '@ionic/angular';
import {ToolModule} from '../tool/tool.module';
import {SysuserRoutingModule} from './sysuser-routing.module';
import {SysuserComponent} from './sysuser.component';
import {SysuserHomeComponent} from './sysuser-home/sysuser-home.component';
import {SysuserChangepasswordComponent} from './sysuser-changepassword/sysuser-changepassword.component';


@NgModule({
    imports: [
        IonicModule,
        ToolModule,
        SysuserRoutingModule
    ],
    declarations: [
        SysuserComponent,
        SysuserHomeComponent,
        SysuserChangepasswordComponent
    ]
})
export class SysuserModule {
}
