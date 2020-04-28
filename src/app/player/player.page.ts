import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import { DataService } from '../services/data.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-player',
  templateUrl: './player.page.html',
  styleUrls: ['./player.page.scss'],
})
export class PlayerPage implements OnInit {
  playlist = [];
  typeId = 0;
  segments: UrlSegment[];
  secretName = new FormControl('');
  secretNameWarning: string = '';
  constructor(private activatedRoute: ActivatedRoute, private dataService: DataService) { }

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

  ngOnInit() {
    this.activatedRoute.url.subscribe((segments: UrlSegment[]) => {
      this.segments = segments;
      this.getPlayList();
    });
  }


  private getPlayList() {
    if (this.segments.length > 0) {
      this.typeId = Number(this.segments[0].path);
      let params = this.segments.filter((f, i) => i > 0).map((x) => x.path);
      this.playlist = this.dataService.getPlayList(this.typeId, this.secretName.value, params);
    }
  }
}
