import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-services-page',
  templateUrl: './services-page.page.html',
  styleUrls: ['./services-page.page.scss'],
})
export class ServicesPagePage implements OnInit {
  services: Array<ServiceModel> = [
    {
      Name: 'Завод времен календарей',
      Id: 1,
      Level: 1,
      Items1: [
        { Name: 'Белое время' },
        { Name: 'Черное время' },
        { Name: 'Серое время' },
        { Name: 'Время Зари' },
        { Name: 'Вертикальный календарь' },
      ],
      Items2: [
        { Name: 'Личное' },
        { Name: 'Общее' }]
    },
    {
      Name: 'Черпачок',
      Id: 10,
      Level: 1,
      Items1: [
        { Name: 'Ритмологичность', Id: 1 },
        { Name: 'Озарённость', Id: 2 },
        { Name: 'Радастейность', Id: 3 },
        { Name: 'Лучистость', Id: 4 },
        { Name: 'Зитуордэнность', Id: 5 },
        { Name: 'Радастовость', Id: 6 },
      ],
      Items2: [
        { Name: 'Опускание', Id: 1 },
        { Name: 'Поднятие', Id: 2 }]
    },


    {
      Name: 'Заряды',
      Id: 100, // unknown 
      Level: 1,
      Items1: [
        { Name: 'ЭнергозаряД', Id: 1, Type: 'chargeEnergo', Url: '/ngenix/audio/Energozaryad.mp3' },
        { Name: 'ИнформозаряД', Id: 2, Type: 'chargeInformo', Url: '/ngenix/audio/informozaryad.mp3' },
        //{ Name: 'Пространственный заряд', Id: 3 },
        { Name: 'Временной заряд', Id: 4, Type: 'chargeTime', Url: '/ngenix/audio/timezaryad.mp3' }
      ],
      Items2: []
    },
    {
      Name: 'Приближение к Ключевым координатам',
      Id: 2,
      Level: 1,
      Items1: [], // unknown 
      Items2: [] // unknown 
    },
    {
      Name: 'Приближение к Лучевым координатам',
      Id: 3,
      Level: 1,
      Items1: [], // unknown 
      Items2: [] // unknown 
    },
    {
      Name: 'Приближение к Основным координатам',
      Id: 4,
      Level: 1,
      Items1: [], // unknown 
      Items2: [] // unknown 
    },

    {
      Name: 'Скафандриальная гимнастика (утро)',
      Id: -1,// unknown 
      Level: 1,
      Items1: [{ Name: 'Утро', Id: 1, Type: 'gymnasticsMorning', Url: '/ngenix/audio/Skafandrialnaya_gimnastika_probuzhdenie.mp3' }],
      Items2: []
    },
    {
      Name: 'Скафандриальная гимнастика (вечер)',
      Id: -1,// unknown 
      Level: 1,
      Items1: [{ Name: 'Утро', Id: 2, Type: 'gymnasticsEvening', Url: '/ngenix/audio/Skafandrialnaya_gimnastika_podgotovka_ko_snu.mp3' }],
      Items2: []
    }
  ];
  constructor(private nav: NavController) { }

  ngOnInit() {
  }

  selectService() {
  }

  // черпачок
  getScoop(scoop, type, coord) {
    var result = [];
    switch (type) {
      case "1":
        result.push({ title: "Полотно своей Страдастеи", src: "/ngenix/coord/polotno.mp3" });
        result.push({ title: coord.keyObraz.name, src: "/ngenix/coord/obrazi/" + coord.keyObraz.filename });
        result.push({ title: coord.keyLobr.name, src: "/ngenix/coord/lobrs/" + coord.keyLobr.filename });
        result.push({ title: coord.stradasteyaDistance.name, src: "/ngenix/coord/rasstoyanie_v_stradastey/" + coord.stradasteyaDistance.filename });
        result.push({ title: coord.radasteyaCanvas.name, src: "/ngenix/coord/radastey/" + coord.radasteyaCanvas.filename });
        result.push({ title: coord.stradasteya.name, src: "/ngenix/coord/stradasteya/" + coord.stradasteya.filename });
        result.push({ title: coord.zituordCanvas.name, src: "/ngenix/coord/zituords/" + coord.zituordCanvas.filename });
        result.push({ title: coord.stradasteyaDistance.name, src: "/ngenix/coord/rasstoyanie_v_stradastey/" + coord.stradasteyaDistance.filename });
        result.push({ title: coord.keyRobl.name, src: "/ngenix/coord/robls/" + coord.keyRobl.filename });
        result.push({ title: coord.keyOblik.name, src: "/ngenix/coord/obliki/" + coord.keyOblik.filename });
        result.push({ title: "Хладастея Минус", src: "/ngenix/audio/ozarin/ozar_minus.mp3" });
        result.push({ title: "Хладастея Отдаления (Даль)", src: "/ngenix/audio/ozarin/ozar_dal.mp3" });
        result.push({ title: "Блокиратор", src: "/ngenix/audio/ozarin/ozar_blokirator.mp3" });
        result.push({ title: coord.stradasteya.name, src: "/ngenix/coord/stradasteya/" + coord.stradasteya.filename });
        result.push({ title: "Глия", src: "/ngenix/audio/ozarin/ozar_glia.mp3" });
        result.push({ title: "Хладастея Приближения (Близь)", src: "/ngenix/audio/ozarin/ozar_bliz.mp3" });
        result.push({ title: "Расстояние в параметрическую Страдастею", src: "/ngenix/coord/distanceParamStradasteya.mp3" });
        result.push({ title: "" + ((coord.stradasteyaParam) ? coord.stradasteyaParam.name : "Расстояние в параметрическую страдастею"), src: "" + ((coord.stradasteyaParam) ? "/ngenix/coord/rasstoyanie_v_stradastey/" + coord.stradasteyaParam.filename : "/ngenix/coord/rasstoyanie_v_stradastey/pred_stradasteyaDistance.mp3") });
        result.push({ title: "Хладастея Плюс", src: "/ngenix/audio/ozarin/ozar_plus.mp3" });
        result.push({ title: "Хладастея Минус", src: "/ngenix/audio/ozarin/ozar_minus.mp3" });
        result.push({ title: "Хладастея Отдаления (Даль)", src: "/ngenix/audio/ozarin/ozar_dal.mp3" });
        result.push({ title: "Блокиратор", src: "/ngenix/audio/ozarin/ozar_blokirator.mp3" });
        result.push({ title: coord.stradasteya.name, src: "/ngenix/coord/stradasteya/" + coord.stradasteya.filename });
        result.push({ title: "Глия", src: "/ngenix/audio/ozarin/ozar_glia.mp3" });
        result.push({ title: "Хладастея Приближения (Близь)", src: "/ngenix/audio/ozarin/ozar_bliz.mp3" });
        result.push({ title: coord.stradasteyaOppositeDistance.name, src: "/ngenix/coord/rasstoyanie_v_stradastey/" + coord.stradasteyaOppositeDistance.filename });
        result.push({ title: "Хладастея Плюс", src: "/ngenix/audio/ozarin/ozar_plus.mp3" });
        break;
      case "2":
        result.push({ title: "Хладастея Плюс", src: "/ngenix/audio/ozarin/ozar_plus.mp3" });
        result.push({ title: coord.stradasteyaOppositeDistance.name, src: "/ngenix/coord/rasstoyanie_v_stradastey/" + coord.stradasteyaOppositeDistance.filename });
        result.push({ title: "Хладастея Приближения (Близь)", src: "/ngenix/audio/ozarin/ozar_bliz.mp3" });
        result.push({ title: "Глия", src: "/ngenix/audio/ozarin/ozar_glia.mp3" });
        result.push({ title: coord.stradasteya.name, src: "/ngenix/coord/stradasteya/" + coord.stradasteya.filename });
        result.push({ title: "Хладастея Минус", src: "/ngenix/audio/ozarin/ozar_minus.mp3" });
        result.push({ title: "Хладастея Отдаления (Даль)", src: "/ngenix/audio/ozarin/ozar_dal.mp3" });
        result.push({ title: "Блокиратор", src: "/ngenix/audio/ozarin/ozar_blokirator.mp3" });
        result.push({ title: "Хладастея Плюс", src: "/ngenix/audio/ozarin/ozar_plus.mp3" });
        result.push({ title: "Расстояние в параметрическую Страдастею", src: "/ngenix/audio/ozarin/ozar_param.mp3" });
        result.push({ title: "" + ((coord.stradasteyaParam) ? coord.stradasteyaParam.name : "Расстояние в параметрическую страдастею"), src: "" + ((coord.stradasteyaParam) ? "/ngenix/coord/rasstoyanie_v_stradastey/" + coord.stradasteyaParam.filename : "/ngenix/coord/rasstoyanie_v_stradastey/pred_stradasteyaDistance.mp3") });
        result.push({ title: "Хладастея Приближения (Близь)", src: "/ngenix/audio/ozarin/ozar_bliz.mp3" });
        result.push({ title: "Глия", src: "/ngenix/audio/ozarin/ozar_glia.mp3" });
        result.push({ title: coord.stradasteya.name, src: "/ngenix/coord/stradasteya/" + coord.stradasteya.filename });
        result.push({ title: "Хладастея Минус", src: "/ngenix/audio/ozarin/ozar_minus.mp3" });
        result.push({ title: "Хладастея Отдаления (Даль)", src: "/ngenix/audio/ozarin/ozar_dal.mp3" });
        result.push({ title: "Блокиратор", src: "/ngenix/audio/ozarin/ozar_blokirator.mp3" });
        result.push({ title: "Полотно своей Страдастеи", src: "/ngenix/audio/ozarin/polotno.mp3" });
        result.push({ title: coord.keyObraz.name, src: "/ngenix/coord/obrazi/" + coord.keyObraz.filename });
        result.push({ title: coord.keyLobr.name, src: "/ngenix/coord/lobrs/" + coord.keyLobr.filename });
        result.push({ title: coord.stradasteyaDistance.name, src: "/ngenix/coord/rasstoyanie_v_stradastey/" + coord.stradasteyaDistance.filename });
        result.push({ title: coord.radasteyaCanvas.name, src: "/ngenix/coord/radastey/" + coord.radasteyaCanvas.filename });
        result.push({ title: coord.stradasteya.name, src: "/ngenix/coord/stradasteya/" + coord.stradasteya.filename });
        result.push({ title: coord.zituordCanvas.name, src: "/ngenix/coord/zituords/" + coord.zituordCanvas.filename });
        result.push({ title: coord.stradasteyaDistance.name, src: "/ngenix/coord/rasstoyanie_v_stradastey/" + coord.stradasteyaDistance.filename });
        result.push({ title: coord.keyRobl.name, src: "/ngenix/coord/robls/" + coord.keyRobl.filename });
        result.push({ title: coord.keyOblik.name, src: "/ngenix/coord/obliki/" + coord.keyOblik.filename });
        break;
    };
    switch (scoop + type) {
      // набор ид **, где  1* - номер черпачка, *1 - опускание, *2 - подъем
      case "11":
        result.splice(15, 0, { title: "Своё сокровенное имя", src: "/ngenix/coord/secret_name.mp3" });
        result.splice(20, 0, { title: coord.matrix.name, src: "/ngenix/coord/matrix/" + coord.matrix.filename });
        result.splice(26, 0, { title: "Своё обратное сокровенное имя", src: "/ngenix/coord/ownSecretNameReverse.mp3" });
        result.splice(30, 0, { title: "Матрица противоположная своей", src: "/ngenix/coord/matrixOpposite.mp3" });
        break;
      case "12":
        result.splice(0, 0, { title: "Матрица противоположная своей", src: "/ngenix/coord/matrixOpposite.mp3" });
        result.splice(4, 0, { title: "Своё обратное сокровенное имя", src: "/ngenix/coord/ownSecretNameReverse.mp3" });
        result.splice(10, 0, { title: coord.matrix.name, src: "/ngenix/coord/matrix/" + coord.matrix.filename });
        result.splice(15, 0, { title: "Своё сокровенное имя", src: "/ngenix/coord/secret_name.mp3" });
        break;
      case "21":
        result.splice(15, 0, { title: coord.obraz.name, src: "/ngenix/coord/obrazi/" + coord.obraz.filename });
        result.splice(20, 0, { title: coord.oblik.name, src: "/ngenix/coord/obliki/" + coord.oblik.filename });
        result.splice(26, 0, { title: coord.keyObraz.name, src: "/ngenix/coord/obrazi/" + coord.keyObraz.filename });
        result.splice(30, 0, { title: coord.keyOblik.name, src: "/ngenix/coord/obliki/" + coord.keyOblik.filename });
        break;
      case "22":
        result.splice(0, 0, { title: coord.keyOblik.name, src: "/ngenix/coord/obliki/" + coord.keyOblik.filename });
        result.splice(4, 0, { title: coord.keyObraz.name, src: "/ngenix/coord/obrazi/" + coord.keyObraz.filename });
        result.splice(10, 0, { title: coord.oblik.name, src: "/ngenix/coord/obliki/" + coord.oblik.filename });
        result.splice(15, 0, { title: coord.obraz.name, src: "/ngenix/coord/obrazi/" + coord.obraz.filename });
        break;
      case "31":
        result.splice(15, 0, { title: coord.radasteya.name, src: "/ngenix/coord/radastey/" + coord.radasteya.filename });
        result.splice(20, 0, { title: coord.zituord.name, src: "/ngenix/coord/zituords/" + coord.zituord.filename });
        result.splice(26, 0, { title: "Лобр Радастеи", src: "/ngenix/coord/lobrs/Lobr_radastei.mp3" });
        result.splice(30, 0, { title: "Образ Радастеи", src: "/ngenix/coord/obrazi/Obraz_radastei.mp3" });
        break;
      case "32":
        result.splice(0, 0, { title: "Образ Радастеи", src: "/ngenix/coord/obrazi/Obraz_radastei.mp3" });
        result.splice(4, 0, { title: "Лобр Радастеи", src: "/ngenix/coord/lobrs/Lobr_radastei.mp3" });
        result.splice(10, 0, { title: coord.zituord.name, src: "/ngenix/coord/zituords/" + coord.zituord.filename });
        result.splice(15, 0, { title: coord.radasteya.name, src: "/ngenix/coord/radastey/" + coord.radasteya.filename });
        break;
      case "41":
        result.splice(15, 0, { title: coord.robl.name, src: "/ngenix/coord/robls/" + coord.robl.filename });
        result.splice(20, 0, { title: coord.lobr.name, src: "/ngenix/coord/lobrs/" + coord.lobr.filename });
        result.splice(26, 0, { title: coord.keyRobl.name, src: "/ngenix/coord/robls/" + coord.keyRobl.filename });
        result.splice(30, 0, { title: coord.keyLobr.name, src: "/ngenix/coord/lobrs/" + coord.keyLobr.filename });
        break;
      case "42":
        result.splice(0, 0, { title: coord.keyLobr.name, src: "/ngenix/coord/lobrs/" + coord.keyLobr.filename });
        result.splice(4, 0, { title: coord.keyRobl.name, src: "/ngenix/coord/robls/" + coord.keyRobl.filename });
        result.splice(10, 0, { title: coord.lobr.name, src: "/ngenix/coord/lobrs/" + coord.lobr.filename });
        result.splice(15, 0, { title: coord.robl.name, src: "/ngenix/coord/robls/" + coord.robl.filename });
        break;
      case "51":
        result.splice(15, 0, { title: coord.zituord.name, src: "/ngenix/coord/zituords/" + coord.zituord.filename });
        result.splice(20, 0, { title: coord.radasteya.name, src: "/ngenix/coord/radastey/" + coord.radasteya.filename });
        result.splice(26, 0, { title: "Робл Радастеи", src: "/ngenix/coord/robls/Robl_radasrei.mp3" });
        result.splice(30, 0, { title: "Облик Радастеи", src: "/ngenix/coord/obliki/Oblik_radastei.mp3" });
        break;
      case "52":
        result.splice(0, 0, { title: "Облик Радастеи", src: "/ngenix/coord/obliki/Oblik_radastei.mp3" });
        result.splice(4, 0, { title: "Робл Радастеи", src: "/ngenix/coord/robls/Robl_radasrei.mp3" });
        result.splice(10, 0, { title: coord.radasteya.name, src: "/ngenix/coord/radastey/" + coord.radasteya.filename });
        result.splice(15, 0, { title: coord.zituord.name, src: "/ngenix/coord/zituords/" + coord.zituord.filename });
        break;
      case "61":
        result.splice(15, 0, { title: "Страдастея Радастеи", src: "/ngenix/coord/stradasteya/radastei.mp3" });
        result.splice(20, 0, { title: "Матрица Радастеи", src: "/ngenix/audio/ozarin/matrixRadastey.mp3" });
        result.splice(26, 0, { title: "Общее сокровенное имя", src: "/ngenix/coord/commonSecretName.mp3" });
        result.splice(30, 0, { title: "Обратное общее сокровенное имя", src: "/ngenix/coord/commonSecretNameReverse.mp3" });
        break;
      case "62":
        result.splice(0, 0, { title: "Обратное общее сокровенное имя", src: "/ngenix/coord/commonSecretNameReverse.mp3" });
        result.splice(4, 0, { title: "Общее сокровенное имя", src: "/ngenix/coord/commonSecretName.mp3" });
        result.splice(10, 0, { title: "Матрица Радастеи", src: "/ngenix/audio/ozarin/matrixRadastey.mp3" });
        result.splice(15, 0, { title: "Страдастея Радастеи", src: "/ngenix/coord/stradasteya/radastei.mp3" });
        break;
    };
    return result;
  };

}


export class ServiceModel {
  public Name: string;
  public Id: number;
  public Level: number;
  public Items1: Array<any>;
  public Items2: Array<any>;;
}
