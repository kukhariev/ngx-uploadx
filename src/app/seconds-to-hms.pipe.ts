import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'secondsToHMS'
})
export class SecondsToHMSPipe implements PipeTransform {
  transform(duration: number | string, nan = '....') {
    const secNum = Math.abs(parseInt(duration + '', 10));
    if (isNaN(secNum) || !isFinite(secNum)) {
      return nan;
    }

    const hours = Math.floor(secNum / 3600),
      minutes = Math.floor(secNum / 60) % 60,
      seconds = secNum % 60;
    const h = hours < 10 ? '0' + hours : hours;
    const m = minutes < 10 ? '0' + minutes : minutes;
    const s = seconds < 10 ? '0' + seconds : seconds;
    return `${h}:${m}:${s}`;
  }
}
