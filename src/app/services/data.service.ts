import { Injectable } from '@angular/core';
import { ServiceModel, NextModel, ServiceChoiceModel, ServicePlayListModel, PlayListModel, ServicePlayListModelObject } from '../backend/interfaces';
import { SettingsService } from './settings.service';
import { BaseComponent } from './base-component';

@Injectable({
  providedIn: 'root'
})
export class DataService extends BaseComponent {
  services: Array<ServiceModel> = [];
  constructor(private settings: SettingsService) {
    super();
    this.settings.getServicesDataAsync.safeSubscribe(this, data => this.services = data)
  }

  getItems(id: number, params: number[]): ServiceChoiceModel {
    let data = this.services.find(f => Number(f.id) === id);

    let current = data.next;
    params.forEach(element => {
      current = current.next;
    });
    return { service: data, current: current };
  }

  getService(serviceId: number): ServiceModel {
    const service = this.services.find(x => Number(x.id) === serviceId);
    return service;
  }

  getSubServiceName(serviceId: number, params: number[]) {
    let services = this.services.find(x => Number(x.id) === serviceId);
    let name = services.name;
    if (params.length === 0) return name;

    let next: NextModel;
    params.forEach(el => {
      if (!next) {
        next = services.next;
      } else {
        next = next.next;
      }
    });
    return next.items.find(f => f.id === params[params.length - 1]).name;
  }

  getFullSectionName(service: ServiceModel, params: number[]): string {
    if (service.id === 1) {
      let level1 = this.getSubServiceName(service.id, [params[0]]);
      let level2 = this.getSubServiceName(service.id, params);
      return `${level1} ${level2}`;
    }
    else if (service.id === 2) {
      let level = this.getSubServiceName(service.id, [params[0]]);
      return `${service.name} ${level} ${(params[1] === 1 ? '↓' : '↑')}`;
    }
    return service.name;
  }


  buildComputedPlayList(playList: ServicePlayListModel, stradasteyaId, radasteyaId, zituordId, secretNameIndexes = []): PlayListModel[] {
    if (!playList) return [];
    if (!playList.main) return [];
    const date = this.getDate();
    const year = date[0];
    const month = date[1];
    const day = date[2];

    let newPlayList: Array<PlayListModel> = [];
    playList.main.forEach(main => {
      if (main.id) {
        let tempArr = []
        switch (main.condition) {
          case 'year': // 2020
            tempArr = playList.additional[main.id][year];
            break;
          case 'month': // 09
            tempArr = playList.additional[main.id][month];
            break;
          case 'day': //01
            tempArr = playList.additional[main.id][day];
            break;
          case 'date': // "2020-12-01"
            let fullDate = [year, month, day].join('-');
            tempArr = playList.additional[main.id][fullDate];
            break;
          case 'dayMonth': // 01-31
            let monthDay = [month, day].join('-');
            tempArr = playList.additional[main.id][monthDay];
            break;
          case 'number':
            if (main.id === 'stradasteya') {
              tempArr = playList.additional[main.id][Number(stradasteyaId)];
            } else
              if (main.id === 'zituord') {
                tempArr = playList.additional[main.id][Number(zituordId)];
              } else
                if (main.id === 'radasteya') {
                  tempArr = playList.additional[main.id][Number(radasteyaId)];
                } else if (main.id === 'video' || main.id === 'live') {
                  tempArr = playList.additional[main.id][Number(stradasteyaId)];
                }
            break;
        }
        if (tempArr) {
          tempArr.forEach(item => {
            newPlayList.push({
              id: main.id,
              isDownload: false,
              name: item.name ? item.name : main.name,
              path: item.path,
              condition: main.condition
            });
          });
        }
      } else {
        // copy object for distinctUntilChanged
        newPlayList.push({
          id: main.id,
          isDownload: main.isDownload,
          name: main.name,
          path: main.path,
          condition: main.condition
        });
      }
    });

    secretNameIndexes.forEach(index => {
      const secret = playList.additional.secretName[index];
      if (secret) {
        secret.forEach(item => {
          newPlayList.push({
            id: '',
            isDownload: false,
            name: item.name,
            path: item.path,
            condition: ''
          });
        });
      }
    })
    return newPlayList;
  }


  //files to download 
  getFilesToDownloads(service: ServiceModel, servicePlayList: ServicePlayListModelObject): PlayListModel[] {
    let playlistToDownload = [];
    Object.values(servicePlayList).forEach((subService: ServicePlayListModel) => {
      switch (service.id) {
        case 1:
          let oneDay = this.buildComputedPlayList(subService, null, null, null, []);
          playlistToDownload.push(...oneDay);
          // console.log(playlistToDownload.length)
          //additional

          //all 
          // playlistToDownload.push(...subService.main.filter(f => !f.id));
          // Object.values(subService.additional).forEach(dayWhite => {
          //   Object.values(dayWhite).forEach(t => {
          //     playlistToDownload.push(...t);
          //   })
          // });
          //
          break;
        case 2:
          playlistToDownload.push(...subService.main);
          break;
        case 3:
          playlistToDownload.push(...subService.main.filter(f => !f.id));
          this.buildAdditionalMainCoord(playlistToDownload, subService.additional.secretName);
          break;
        case 4:
          playlistToDownload.push(...subService.main);
          break;
        case 5:
          playlistToDownload.push(...subService.main.filter(f => !f.id));
          this.buildAdditionalMainCoord(playlistToDownload, subService.additional.stradasteya);
          this.buildAdditionalMainCoord(playlistToDownload, subService.additional.radasteya);
          this.buildAdditionalMainCoord(playlistToDownload, subService.additional.zituord);
          break;

        case 11:
          this.buildAdditionalMainCoord(playlistToDownload, subService.additional.video);
          break;
        default:
          playlistToDownload.push(...subService.main);
          break;
      }
    });
    //only uniq 
    let paths = playlistToDownload.map((obj) => obj.path);
    let unique = playlistToDownload.filter((el, index) => index === paths.indexOf(el.path));
    // console.table(paths);
    console.log(`Count of files what you can download. all: ${playlistToDownload.length} / unique:${unique.length}`);
    return unique;
  }

  private buildAdditionalMainCoord(playlistToDownload: PlayListModel[], data: any) {
    console.log(data);
    Object.values(data).forEach((val: any) => {
      val.forEach(element => {
        playlistToDownload.push({
          name: element.name,
          path: element.path,
          condition: '',
          id: '',
          isDownload: false
        });
      });
    });

    return playlistToDownload;
  }

  getDate() {
    var d = new Date(),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;

    return [year, month, day];
  }
}
