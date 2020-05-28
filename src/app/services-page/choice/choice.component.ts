import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { NextModel, NameIdModel } from 'src/app/backend/interfaces';

@Component({
  selector: 'app-choice',
  templateUrl: './choice.component.html',
  styleUrls: ['./choice.component.scss'],
})
export class ChoiceComponent implements OnInit {
  model: NextModel = { items: [], next: null };
  id: number;
  params?: Array<number> = [];
  subSectionName: string;
  constructor(private nav: NavController, private router: Router, private activatedRoute: ActivatedRoute, private dataService: DataService) { }

  choice(item: NameIdModel, next: NextModel) {
    this.params.push(item.id);
    if (next) {
      this.router.navigate([`/services/${this.id}/${(this.params.join('/'))}`]);
    }
    else {
      this.router.navigate([`/player/${this.id}/${(this.params.join('/'))}`]);
    }
  }

  ngOnInit() {
    this.activatedRoute.url.subscribe((segments: UrlSegment[]) => {
      this.id = Number(segments[0].path);
      this.params = segments.filter((f, i) => i > 0).map((x) => Number(x.path));
      this.model = this.dataService.getItems(this.id, this.params);
      this.subSectionName = this.dataService.getSubServiceName(this.id, this.params);
    });
  }
}
