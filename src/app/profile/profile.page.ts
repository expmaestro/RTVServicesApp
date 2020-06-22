import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../services/settings.service';
import { LoginService } from '../services/login.service';
import { NavController, ToastController, LoadingController, AlertController } from '@ionic/angular';
import { File } from '@ionic-native/file/ngx';
import { FilesService } from '../services/files.service';
import { NetworkService } from '../services/network.service';
import { BaseComponent } from '../services/base-component';
import { Profile } from '../backend/interfaces';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage extends BaseComponent implements OnInit {

  public data: Profile = new Profile();
  private loading: any;
  subscription: any;
  constructor(private settingsService: SettingsService, private loginService: LoginService, private nav: NavController,
    private file: File, private fileService: FilesService, private toastController: ToastController,
    private loadingCtrl: LoadingController, private networkService: NetworkService, private alertController: AlertController) {
    super();
    this.settingsService.getUserData();
  }

  logout() {
    this.networkService.pingApiRequest().then(isConneted => {
      if (isConneted) {
        this.logoutAlert('', 'Вы уверены, что хотите выйти?', true);
      } else {
        this.logoutAlert('Нет сети', 'Вы уверены, что хотите выйти?<br><br>Для того, чтобы авторизоваться заново потребуется подключение к сети', false);
      }
    });

  }

  private async logoutAlert(header: string, message: string, needRequest: boolean) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: [
        {
          text: 'Отмена',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Выйти',
          handler: () => {
            if (needRequest) {
              this.loginService.logout().subscribe((r) => {
                this.settingsService.authToken = null;
                //TODO: clear storage
                this.nav.navigateRoot('/login');
              });
            } else {
              this.settingsService.authToken = null;
              //TODO: clear storage
              this.nav.navigateRoot('/login');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  imitateLogout() {
    this.loginService.logout().subscribe((r) =>
      console.log(r));
  }

  ionViewWillLeave() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  } 


  async clear() {
    console.log('clear')
    this.loading = await this.loadingCtrl.create({
      message: 'Пожалуйста подождите...'
    });
    await this.loading.present();
    this.file.removeRecursively(this.file.dataDirectory, this.fileService.getAudioFolder).then(
      async (entry) => {
        this.presentToast('Медиа кэш очищен успешно.');
      },
      async (error) => {
        if (error.message === 'NOT_FOUND_ERR') {
          // already cleared
          this.presentToast('Медиа кэш очищен успешно.');
        }
        console.log(error);

      }).finally(async () => {
        await this.loading.dismiss();
      })
  }

  private async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: 'secondary'
    });
    toast.present();
  }

  getId(type, name) {
    let obj = this.variants.data[type].enum;
    return Object.keys(obj).find(x => obj[x] === name);
  }

  change(e, type) {
    console.log(e);
    console.log(e.target.value);
    this.settingsService.updateUserCoordApi(type, e.target.value).subscribe((r) => {
      this.settingsService.setProfileData = r.data;
      this.prepareData();
      this.presentToast('Данные успешно сохранены');
    }, (e) => {
      this.presentToast('Ошибка сохранения данных');
    });
  }

  ngOnInit() {
    this.subscription = this.settingsService.getProfileDataAsync.safeSubscribe(this, (r: any) => {
      this.data = r;
      this.prepareData();
    });
  }

  private prepareData() {

    if (this.data != null) {
      this.getEnumId('matrix');
      this.getEnumId('rPosition');
      this.getEnumId('softSignPosition');
      this.getEnumId('solidSignPosition');
      this.getEnumId('obraz');
      this.getEnumId('oblik');
      this.getEnumId('lobr');
      this.getEnumId('robl');
      this.getEnumId('stradasteya');
    }
  }

  private getEnumId(type: string) {
    let obj = this.variants.data[type].enum;
    this.data[type].enumId = Object.keys(obj).find(x => this.data[type].value === obj[x]);
  }

  public variants =
    {
      "data": {
        "matrix": {
          "name": "Матрица",
          "id": "UF_MATRIX",
          "enum": {
            "2": "Логика",
            "3": "Кардиоида",
            "4": "Оригинал",
            "5": "Восприятия",
            "6": "Практика",
            "7": "Воспроизведения",
            "8": "Конхоида",
            "9": "Вразумления",
            "10": "Теоретика",
            "11": "Логистика",
            "12": "Тороида",
            "13": "Пираусмидакон",
            "14": "Нужности",
            "15": "Важности",
            "16": "Целесообразности",
            "17": "Цельности",
            "18": "Целостности",
            "207": "Сертификат (прошёл программу)",
            "252": "Циклоид",
            "483": "не получал"
          }
        },
        "rPosition": {
          "name": "Р в Сокровенном имени",
          "id": "UF_BUKVAR_SI",
          "enum": {
            "258": "1",
            "259": "2",
            "260": "3",
            "261": "4",
            "262": "5",
            "263": "6",
            "264": "7",
            "265": "9",
            "266": "8",
            "267": "10",
            "634": "не получал",
            "644": "Сертификат (прошёл программу)"
          }
        },
        "softSignPosition": {
          "name": "Ь в Сокровенном имени",
          "id": "UF_BUKVA_MZ_SI",
          "enum": {
            "268": "1",
            "269": "2",
            "270": "3",
            "271": "4",
            "272": "5",
            "273": "6",
            "274": "7",
            "275": "8",
            "276": "9",
            "277": "10",
            "635": "не получал",
            "643": "Сертификат (прошёл программу)"
          }
        },
        "solidSignPosition": {
          "name": "Ъ в Сокровенном имени",
          "id": "UF_BUKVA_TZ_SI",
          "enum": {
            "278": "1",
            "279": "2",
            "280": "3",
            "281": "4",
            "282": "5",
            "283": "6",
            "284": "7",
            "285": "8",
            "286": "9",
            "287": "10",
            "633": "не получал",
            "642": "Сертификат (прошёл программу)"
          }
        },
        "obraz": {
          "name": "Образ",
          "id": "UF_OBRAZ",
          "enum": {
            "149": "Нити",
            "150": "Свечения",
            "151": "Ноля",
            "152": "Вибраций",
            "153": "Красоты",
            "154": "Чистоты",
            "155": "Диалектики",
            "156": "Счастья",
            "157": "Лепестка",
            "158": "Циферблата",
            "159": "Лука",
            "160": "Циркуля",
            "161": "Света",
            "162": "Ключа",
            "163": "Чаши",
            "164": "Сферы",
            "165": "Истины",
            "166": "Сияния",
            "167": "Мозга",
            "168": "Перехода",
            "169": "Корня",
            "206": "Сертификат (прошёл программу)",
            "484": "не получал"
          }
        },
        "oblik": {
          "name": "Облик",
          "id": "UF_OBLIK",
          "enum": {
            "170": "Нормы",
            "171": "Контакта",
            "172": "Достатка",
            "173": "Гения",
            "174": "Таланта",
            "175": "Связи",
            "176": "Достоинства",
            "177": "Цели",
            "178": "Изобилия",
            "179": "Секрета",
            "180": "Вежливости",
            "181": "Солнца",
            "182": "Разума",
            "183": "Награды",
            "184": "Неба",
            "185": "Сути",
            "186": "Уверенности",
            "187": "Плоти",
            "188": "Звезды",
            "189": "Пути",
            "190": "Смысла",
            "191": "Правителя",
            "192": "Удобства",
            "193": "Смелости",
            "194": "Старта",
            "195": "Читателя",
            "196": "Стабильности",
            "197": "Сертификат (прошёл программу)",
            "485": "не получал"
          }
        },
        "lobr": {
          "name": "Лобр",
          "id": "UF_LOBR",
          "enum": {
            "22": "Общения",
            "23": "Беседы",
            "24": "Полёта",
            "25": "Друзей",
            "26": "Сотрудничества",
            "27": "Вдохновения",
            "28": "Откровения",
            "29": "Причины",
            "30": "Богатства",
            "31": "Изысканности",
            "32": "Голоса",
            "33": "Успеха",
            "34": "Соития",
            "35": "Совершенства",
            "36": "Огня",
            "37": "Вместимости",
            "38": "Любви",
            "39": "Знака",
            "40": "Дуновения",
            "41": "Здоровья",
            "42": "Вечности",
            "43": "Жизни",
            "44": "Охлаждения",
            "45": "Развёртки",
            "46": "Творчества",
            "47": "Сердца",
            "48": "Знамения",
            "49": "Начала",
            "50": "Встречи",
            "51": "Реальности",
            "52": "Сгустка",
            "53": "Милости",
            "54": "Времени",
            "55": "Результата",
            "56": "Рубежа",
            "57": "Прочности",
            "58": "Активности",
            "59": "Планеты",
            "60": "Удачи",
            "61": "Свёртки",
            "204": "Сертификат (прошёл программу)",
            "486": "не получал"
          }
        },
        "robl": {
          "name": "Робл",
          "id": "UF_ROBL",
          "enum": {
            "202": "Сертификат (прошёл программу)",
            "208": "Будущего",
            "209": "Единения",
            "210": "Замедления",
            "211": "Зари",
            "212": "Звучания",
            "213": "Земли",
            "214": "Зенита",
            "215": "Знамени",
            "216": "Книги",
            "217": "Короны",
            "218": "Ладоней",
            "219": "Мановения",
            "220": "Мира",
            "221": "Млечности",
            "222": "Моста",
            "223": "Мудрости",
            "224": "Наслаждения",
            "225": "Обнуления",
            "226": "Обретения",
            "227": "Окончания",
            "228": "Праздника",
            "229": "Процесса",
            "230": "Развёртки",
            "231": "Рассвета",
            "232": "Регламента",
            "233": "Результата",
            "234": "Рождения",
            "235": "Свёртки",
            "236": "Свидания",
            "237": "Скорости",
            "238": "Соответствия",
            "239": "Сохранения",
            "240": "Спешности",
            "241": "Стоп",
            "242": "Стража",
            "243": "Тоннеля",
            "244": "Ученика",
            "245": "Филигранности",
            "246": "Формы",
            "247": "Хладности",
            "248": "Цвета",
            "249": "Человека",
            "250": "Эфира",
            "251": "Языка",
            "487": "не получал"
          }
        },
        "stradasteya": {
          "name": "Страдастея",
          "id": "UF_STRADASTEYA",
          "enum": {
            "62": "Долга",
            "63": "Ночи",
            "64": "Сознания",
            "65": "Свёртки",
            "66": "Источника",
            "67": "Фрагмента",
            "68": "Радости",
            "69": "Адреса",
            "70": "Действия",
            "71": "Венца",
            "72": "Модели",
            "73": "Знакоряда",
            "74": "Оси",
            "75": "Вопроса",
            "76": "Ритмопроброса",
            "77": "Невероятности",
            "78": "Солитона",
            "79": "Входа",
            "80": "Времени",
            "81": "Решения",
            "82": "Знания",
            "83": "Ритмомеры",
            "84": "Ритмовремени",
            "85": "Удовольствия",
            "86": "Памяти",
            "87": "Волновода",
            "88": "События",
            "89": "Ритмологии",
            "90": "Пространства",
            "91": "Дешифровки",
            "92": "Желаний",
            "93": "Выхода",
            "94": "Прозрачности",
            "95": "Отцовства",
            "96": "Ленты",
            "97": "Информации",
            "98": "Ликования",
            "99": "Побуждения",
            "100": "Знакомства",
            "101": "Победы",
            "102": "Поля",
            "103": "Энергии",
            "104": "Разума",
            "105": "Экспедиций",
            "106": "Контроля",
            "107": "Предрадастеи",
            "108": "Масс",
            "109": "Созвездий",
            "110": "Правды",
            "111": "Искусства",
            "112": "Вестника",
            "113": "Пламенного",
            "114": "Множеств",
            "115": "Пакета",
            "116": "Возврата",
            "117": "Интереса",
            "118": "Эффекта",
            "119": "Ресниц",
            "120": "Календаря",
            "121": "Импульса",
            "122": "Эгрегора",
            "123": "Абсолюта",
            "124": "Астрологиста",
            "125": "Этноса",
            "126": "Знакопрочтения",
            "127": "Щедрости",
            "128": "Готовности",
            "129": "Сокровищ",
            "130": "Случения",
            "131": "Резюме",
            "132": "Галактики",
            "133": "Заботы",
            "134": "Монолита",
            "135": "Лона",
            "136": "Часов",
            "137": "Пустоты",
            "138": "Мар-СТОП",
            "139": "Монады",
            "140": "Поворота",
            "141": "Ответа",
            "142": "Развёртки",
            "143": "Голограммы",
            "144": "Псевдожизни",
            "145": "Интеллекта",
            "146": "Открытий",
            "147": "Материнства",
            "148": "Семени",
            "491": "не получал",
            "580": "Наблюдателя",
            "641": "Прошёл программу"
          }
        }
      }
    }
}


