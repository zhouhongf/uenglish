import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PreviewimgService {
  constructor() {
  }

  getReader(resolve, reject) {
    const reader = new FileReader();
    reader.onload = this.Onload(reader, resolve);
    reader.onerror = this.OnError(reader, reject);
    return reader;
  }

  readAsText(file) {
    const that = this;
    return new Promise((resolve, reject) => {
      const reader = that.getReader(resolve, reject);
      reader.readAsText(file, 'utf8');
    });
  }

  readAsDataUrl(file) {
    const that = this;
    return new Promise((resolve, reject) => {
      const reader = that.getReader(resolve, reject);
      reader.readAsDataURL(file);
    });
  }

  readAsArrayBuffer(blob) {
    const that = this;
    return new Promise( (resolve, reject) => {
      const reader = that.getReader(resolve, reject);
      reader.readAsArrayBuffer(blob);
    });
  }

  Onload(reader: FileReader, resolve) {
    return () => {
      resolve(reader.result);
    };
  }

  OnError(reader: FileReader, reject) {
    return () => {
      reject(reader.result);
    };
  }

  dataUrlToFile(dataurl, filename = 'file') {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const suffix = mime.split('/')[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], `${filename}.${suffix}`, {
      type: mime
    });
  }

  convertFilesToBase64s(files: Array<File>): Observable<any> {
    return new Observable(observer => {
      const base64List = [];
      for (const one of files) {
        this.readAsDataUrl(one).then(value => {
          base64List.push(value);
        });
      }
      observer.next(base64List);
    });
  }

  readAsDataUrlWithCompress(file, w, outputFormat = 'image/jpeg') {
    const that = this;
    return new Promise( (resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      let quality = 0.8; // 压缩系数0-1之间
      let imgWidth;
      let imgHeight;
      that.readAsDataUrl(file).then(base64 => {
        img.src = base64.toString();
        img.onload = () => {
          imgWidth = img.width;
          imgHeight = img.height;
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (Math.max(imgWidth, imgHeight) > w) {
            if (imgWidth > imgHeight) {
              canvas.width = w;
              canvas.height = w * imgHeight / imgWidth;
            } else {
              canvas.height = w;
              canvas.width = w * imgWidth / imgHeight;
            }
          } else {
            canvas.width = imgWidth;
            canvas.height = imgHeight;
            quality = 0.6;
          }
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const imgBase64 = canvas.toDataURL(outputFormat, quality);
          // 如想确保图片压缩到自己想要的尺寸,如要求在50-150kb之间，请加以下语句，quality初始值根据情况自定
          // while (base64.length / 1024 > 150) {
          // 	quality -= 0.01;
          // 	base64 = canvas.toDataURL("image/jpeg", quality);
          // }
          // 防止最后一次压缩低于最低尺寸，只要quality递减合理，无需考虑
          // while (base64.length / 1024 < 50) {
          // 	quality += 0.001;
          // 	base64 = canvas.toDataURL("image/jpeg", quality);
          // }
          resolve(imgBase64);
        };
      });
    });
  }


  readAsDataUrlByFilePath(filePath, w, outputFormat = 'image/jpeg') {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      let quality = 0.8; // 压缩系数0-1之间
      let imgWidth;
      let imgHeight;
      img.src = filePath;
      img.onload = () => {
        imgWidth = img.width;
        imgHeight = img.height;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (Math.max(imgWidth, imgHeight) > w) {
          if (imgWidth > imgHeight) {
            canvas.width = w;
            canvas.height = w * imgHeight / imgWidth;
          } else {
            canvas.height = w;
            canvas.width = w * imgWidth / imgHeight;
          }
        } else {
          canvas.width = imgWidth;
          canvas.height = imgHeight;
          quality = 0.6;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imgBase64 = canvas.toDataURL(outputFormat, quality);
        // 如想确保图片压缩到自己想要的尺寸,如要求在50-150kb之间，请加以下语句，quality初始值根据情况自定
        // while (base64.length / 1024 > 150) {
        // 	quality -= 0.01;
        // 	base64 = canvas.toDataURL("image/jpeg", quality);
        // }
        // 防止最后一次压缩低于最低尺寸，只要quality递减合理，无需考虑
        // while (base64.length / 1024 < 50) {
        // 	quality += 0.001;
        // 	base64 = canvas.toDataURL("image/jpeg", quality);
        // }
        resolve(imgBase64);
      };
    });
  }
}
