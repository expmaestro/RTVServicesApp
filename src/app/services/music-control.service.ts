import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { PlayListModel } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class MusicControlService {

  playlist$ = new BehaviorSubject<PlayListModel[]>([]);
  currentIndex$ = new BehaviorSubject<number>(-1);
  sectionName$ = new Subject<string>();
  runTrack$ = new Subject<number>();
  playlistAreSame$ = new BehaviorSubject<boolean>(true);

  get getPlaylist() {
    return this.playlist$.asObservable();
  }

  get sectionName() {
    return this.sectionName$.asObservable();
  }

  get playlistAreSame() {
    return this.playlistAreSame$.asObservable();
  }

  constructor() { }

  
  
}
