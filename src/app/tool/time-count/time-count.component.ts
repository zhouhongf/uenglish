import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, Output} from '@angular/core';

@Component({
  selector: 'app-time-count',
  templateUrl: './time-count.component.html',
  styleUrls: ['./time-count.component.scss'],
})
export class TimeCountComponent implements AfterViewInit, OnDestroy {

  @Input() endTime: number;
  @Output() onTimeUp = new EventEmitter();

  day: number;
  hour: number;
  minute: number;
  second: number;

  _timeval: number;
  timer;

  constructor() { }

  get timeval() {
    return this._timeval;
  }

  set timeval(val) {
    this._timeval = Math.floor(val / 1000);
    this.day = Math.floor(this._timeval / 86400);
    this.hour = Math.floor((this._timeval % 86400) / 3600);
    this.minute = Math.floor(((this._timeval % 86400) % 3600) / 60);
    this.second = ((this._timeval % 86400) % 3600) % 60;
  }

  ngAfterViewInit() {
    this.timer = setInterval(() => {
      this.timeval = this.endTime - Date.now();
      if (this.timeval <= 0) {
        clearInterval(this.timer);
        this.day = 0;
        this.hour = 0;
        this.minute = 0;
        this.second = 0;
        console.log('倒计时结束');
        this.onTimeUp.emit(0);
      }
    }, 1000);
  }

  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

}
