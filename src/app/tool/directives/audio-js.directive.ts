import {AfterViewInit, Directive, ElementRef, Input, OnDestroy, Renderer2} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import * as $ from 'jquery';


export class AudioHelper {

  static loadBlob(http: HttpClient, url: string, dom: HTMLElement, cb?: () => void) {
    return http.get(url, {responseType: 'blob'}).subscribe(data => {
      dom.setAttribute('src', URL.createObjectURL(data));
    });
  }


  /**
   * 秒转为时间格式
   */
  static NumberToDate(value: number) {
    if (!value) {
      return '失败';
    }
    let second = Math.floor(value);
    let minite = 0;
    if (second > 60) {
      minite = Math.floor(second / 60);
      second = second % 60;
    }

    let result = '';
    if (second > 10 && minite < 10) {
      result = '0' + minite + ':' + second;
    } else if (second < 10 && minite < 10) {
      result = '0' + minite + ':' + '0' + second;
    } else if (second > 10 && minite > 10) {
      result = minite + ':' + second;
    } else if (second < 10 && minite > 10) {
      result = minite + ':' + '0' + second;
    }
    return result;
  }
}


@Directive({
  selector: '[appAudioJs]'
})
export class AudioJsDirective implements AfterViewInit, OnDestroy {
  /**
   * 温馨提示：
   * (1)在div中放入属性指令，同时必须要有一个父级div；
   * (2)在使用该directive的component的css文件中，设置相应名称的css。
   * (3)只适用于页面第一次加载，以及页面销毁后，再加载
   */
  @Input() url = '';
  @Input() isMax = false;

  interl: any;

  constructor(private elementRef: ElementRef, private renderer2: Renderer2, private http: HttpClient) {
  }

  ngAfterViewInit() {
    let currentTime = 0;        // 当前播放时长
    const audio = this.renderer2.createElement('audio');
    const p = this.elementRef.nativeElement as HTMLElement;

    this.renderer2.addClass(p, 'play-audio');
    p.appendChild(audio);
    AudioHelper.loadBlob(this.http, this.url, audio);
    // 完整播放器的操作
    if (this.isMax) {
      this.renderer2.addClass(p.parentElement, 'parent-div-audio');
      this.renderer2.setStyle(p, 'margin-left', '15px');
      this.renderer2.setStyle(p, 'margin-top', '10px');

      const audioTime = this.renderer2.createElement('div');      // 时间
      const allProgressDiv = this.renderer2.createElement('div'); // 进度条
      const sliderDiv = this.renderer2.createElement('div');      // 滑动条
      const dragCircleDiv = this.renderer2.createElement('div');  // 拖拽圆球
      // 给进度条他们分别添加class样式
      p.parentElement.appendChild(audioTime);
      this.renderer2.addClass(audioTime, 'audio-time');
      p.parentElement.appendChild(allProgressDiv);
      this.renderer2.addClass(allProgressDiv, 'allProgress');
      allProgressDiv.appendChild(sliderDiv);
      this.renderer2.addClass(sliderDiv, 'pro-slider');
      allProgressDiv.appendChild(dragCircleDiv);
      this.renderer2.addClass(dragCircleDiv, 'drag-circle');
      // audio.duration为录音总时长
      setTimeout(() => {
        audioTime.innerText = AudioHelper.NumberToDate(audio.duration);
      }, 500);

      p.addEventListener('click', (e) => {
        if (audio.paused) {
          this.interl = setInterval(() => {
            currentTime = currentTime + 0.1;
            this.renderer2.setStyle(sliderDiv, 'width', (currentTime / audio.duration) * 110 + 'px');
          }, 100);
        }
      });

    }
    // 播放失败操作
    setTimeout(() => {
      if (!audio.duration) {
        this.renderer2.removeClass(p, 'play-audio');
        this.renderer2.addClass(p, 'black-audio');
      }
    }, 2000);
    // 点击暂停，播放操作
    p.onclick = (event) => {
      event.stopPropagation();
      if (audio.paused) {
        // 单个播放器播放，不允许多个播放操作
        const audioFiveParent = p.parentElement.parentElement.parentElement.parentElement.parentElement.querySelector('.pause-audio');
        if (audioFiveParent) {
          this.renderer2.addClass(audioFiveParent, 'play-audio');
          this.renderer2.removeClass(audioFiveParent, 'pause-audio');
          const audioFiveParentToAny = audioFiveParent.firstChild as any;     // 防止编译报错转换为any类型
          audioFiveParentToAny.pause();
        }

        audio.play();
        this.renderer2.removeClass(p, 'play-audio');
        this.renderer2.addClass(p, 'pause-audio');
      } else {
        audio.pause();
        clearInterval(this.interl);
        this.renderer2.addClass(p, 'play-audio');
        this.renderer2.removeClass(p, 'pause-audio');
      }
    };
    $('audio').on('ended', () => {
      this.renderer2.addClass(p, 'play-audio');
      this.renderer2.removeClass(p, 'pause-audio');
      clearInterval(this.interl);
      currentTime = 0;
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.interl);
  }

}
