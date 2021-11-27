import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';

import {IonicModule, IonicRouteStrategy} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {IonicStorageModule} from '@ionic/storage';
import {HttpClientModule} from '@angular/common/http';
import {SQLite} from '@ionic-native/sqlite/ngx';
import {AndroidPermissions} from '@ionic-native/android-permissions/ngx';
import {HashLocationStrategy, LocationStrategy} from '@angular/common';
import {BackgroundMode} from '@ionic-native/background-mode/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import { File } from '@ionic-native/file/ngx';
import {HTTP} from '@ionic-native/http/ngx';
import {TextToSpeech} from '@ionic-native/text-to-speech/ngx';


@NgModule({
    declarations: [AppComponent],
    entryComponents: [],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        IonicModule.forRoot(),
        IonicStorageModule.forRoot({
            name: 'myworld_db',
            driverOrder: ['indexeddb', 'sqlite', 'websql', 'localstorage']
        }),
        AppRoutingModule
    ],
    providers: [
        StatusBar,
        SplashScreen,
        Camera,
        SQLite,
        BackgroundMode,
        AndroidPermissions,
        File,
        HTTP,
        TextToSpeech,
        {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
        {provide: LocationStrategy, useClass: HashLocationStrategy},
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
