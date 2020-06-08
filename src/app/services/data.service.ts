import { Injectable } from '@angular/core';
import { ServiceModel, NextModel, ServiceChoiceModel, ServicePlayListModel, PlayListModel } from '../backend/interfaces';
import { SettingsService } from './settings.service';
import { BaseComponent } from './base-component';

@Injectable({
  providedIn: 'root'
})
export class DataService extends BaseComponent {
  services: Array<ServiceModel> = [];
  constructor(private settings: SettingsService) {
    super();
    this.settings.getServicesDataAsync.safeSubscribe(this, d => this.services = d)
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


  //files to download 
  getFilesToDownloads(service: ServiceModel, servicePlayList: ServicePlayListModel): PlayListModel[] {
    let playlistToDownload = [];
    if (service.id === 5) {
      playlistToDownload = [...servicePlayList.main.filter(f => !f.id)];
      this.buildAdditionalMainCoord(playlistToDownload, servicePlayList.additional.radasteya);
      this.buildAdditionalMainCoord(playlistToDownload, servicePlayList.additional.zituord);
    } else if (service.id === 3) {
      playlistToDownload = [...servicePlayList.main.filter(f => !f.id)];
      this.buildAdditionalMainCoord(playlistToDownload, servicePlayList.additional.secretName)
    }

    return playlistToDownload;
  }

  private buildAdditionalMainCoord(playlistToDownload: PlayListModel[], data: any) {
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
}
