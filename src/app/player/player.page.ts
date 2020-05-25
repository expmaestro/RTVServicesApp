import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, NgZone } from '@angular/core';
import { BaseComponent } from '../services/base-component';
import { MusicControlService } from '../services/music-control.service';
import { PlayListModel, DataService } from '../services/data.service';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-player',
  templateUrl: './player.page.html',
  styleUrls: ['./player.page.scss'],
})
export class PlayerPage extends BaseComponent implements OnInit {
  playlist: PlayListModel[] = [];
  segments: UrlSegment[];
  secretName = new FormControl('');
  secretNameWarning: string = '';
  typeId = 0;
  currentIndex = -1;
  playlistAreSame: boolean;

  constructor(private musicControlService: MusicControlService, private activatedRoute: ActivatedRoute,
    private dataService: DataService, ) {
    super()
  }

  setSecretName() {
    this.secretNameWarning = '';
    const letters: string[] = ['А', 'О', 'У', 'Я', 'И', 'Е', 'Ы', 'Ь', 'Ъ', 'Р'];
    const noLetters: string[] = [];
    const input: string = this.secretName.value.toLowerCase();
    letters.forEach(letter => {
      if (!input.includes(letter.toLowerCase())) {
        noLetters.push(letter)
      }
    });
    if (noLetters.length > 0) {
      this.secretNameWarning = `Вы не ввели буквы: ${noLetters.join(', ')}`;
    }
    this.getPlayList();
  }

  private getPlayList() {
    if (this.segments.length > 0) {
      this.typeId = Number(this.segments[0].path);
      let params = this.segments.filter((param, index) => index > 0).map((x) => x.path);
      this.playlist = this.dataService.getPlayList(this.typeId, this.secretName.value, params);
      this.musicControlService.playlist$.next(this.playlist);
      this.musicControlService.sectionName$.next(this.dataService.getServiceName(Number(this.segments.length > 0 ? this.segments[0].path : 0)));
      console.log(this.playlist);
    }
  }

  public play(index) {
    this.musicControlService.runTrack$.next(index);
  }

  ngOnInit() {

    this.activatedRoute.url.safeSubscribe(this, (segments: UrlSegment[]) => {
      this.segments = segments;
      this.getPlayList();
      let key = segments.map((x) => Number(x.path));
      //this.musicControlService.playlistKey$.next(key.join('-'));
      this.musicControlService.currentIndex$.safeSubscribe(this, (index) => {
        this.currentIndex = index;
      });

      this.musicControlService.playlistAreSame$.safeSubscribe(this, (same) => {
        this.playlistAreSame = same
      });

    });
  }


}
