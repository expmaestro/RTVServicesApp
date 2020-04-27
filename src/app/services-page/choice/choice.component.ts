import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { NextModel, DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-choice',
  templateUrl: './choice.component.html',
  styleUrls: ['./choice.component.scss'],
})
export class ChoiceComponent implements OnInit {
  model: NextModel = { Items: [], Next: null };
  id: number;
  params?: Array<number> = [];
  constructor(private nav: NavController, private router: Router, private activatedRoute: ActivatedRoute, private dataService: DataService) { }

  choice(item: any, next: NextModel) {
    this.params.push(item.Id);
    if (next) {
     // debugger;
      this.router.navigate([`/services/${this.id}/${(this.params.join('/'))}`]);
    }
    else {
      this.router.navigate([`/player/${this.id}/${(this.params.join('/'))}`]);
    }
  }

  ngOnInit() {
    console.log('choice');
    this.activatedRoute.url.subscribe((segments: UrlSegment[]) => {
      this.id = Number(segments[0].path);
      this.params = segments.filter((f, i) => i > 0).map((x) => Number(x.path));
      this.model = this.dataService.getItems(this.id, this.params.length > 0 ? Number(this.params[0]) : -1);
    });



  }

}
