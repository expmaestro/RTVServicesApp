import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { SettingsService } from './settings.service';
import { environment } from 'src/environments/environment';
import { NavController } from '@ionic/angular';

const tokenKey = 'PushNotificationsToken';
import {
  Plugins,
  PushNotification,
  PushNotificationToken,
  PushNotificationActionPerformed,
  Capacitor,
} from '@capacitor/core';

const { PushNotifications } = Plugins;
@Injectable({
  providedIn: 'root'
})

export class PushNotificationsService {

  constructor(private settingsService: SettingsService, 
    private http: HttpClient, 
    private zone: NgZone,
    private navController: NavController) { }

  private get pushToken(): string {
    return localStorage.getItem(tokenKey);
  }

  private set pushToken(value) {
    localStorage.setItem(tokenKey, value);
  }

  public updateToken() {
    this.settingsService.IsLoggedIn().then((isLoggedIn) => {
      if (!isLoggedIn) return;
      if (this.pushToken) {
        let body = JSON.stringify({ token: this.pushToken });
        this.http
          .post(environment.apiUrl + '/back/srv/mobile/user.php?action=setPushToken', body, {
            responseType: 'text',
          })
          .subscribe(
            (response) => {
              console.log('update token success');
            },
            (error) => {
              console.log('update token error');
            }
          );
      }
    });
  }

  public initPush() {
    const isPushNotificationsAvailable = Capacitor.isPluginAvailable('PushNotifications');
    console.log(Capacitor);   

    console.log('initPush initPushinitPush')
    PushNotifications.requestPermission().then((result) => {
      if (result.granted) {
        console.log(result)
        // Register with Apple / Google to receive push via APNS/FCM
        PushNotifications.register();
      } else {
        console.log('some error');
        // Show some error
      }
    });
    PushNotifications.addListener(
      'registration',
      (token: PushNotificationToken) => {
        alert('Push registration success, token: ' + token.value);
        if (token.value) {
          console.log("Push token: " + token.value);
          this.pushToken = token.value;
          this.updateToken();
        }
      }
    );

     // Some issue with our setup and push will not work
     PushNotifications.addListener('registrationError',
     (error: any) => {
       alert('Error on registration: ' + JSON.stringify(error));
     }
   );

    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotification) => {
        alert('Push received: ' + JSON.stringify(notification));
        this.handle(notification);
      }
    );

    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification: PushNotificationActionPerformed) => {
        alert('Push action performed: ' + JSON.stringify(notification));
        this.handle(notification.notification, true);
      }
    );
  }


  private handle(notification: PushNotification, isTapped = false) {
    this.zone.run(() => {
      var additional = <any>notification.data;
      if (additional) 
      if(isTapped) {
        this.navController.navigateForward('/tabs/services');
      }
      // {
      //   switch (additional.type) {
      //     case NotificationTypeEnum.SyncResultCategoryState:
      //       this.CompetitionService.updateMyCompetitonDetails(
      //         additional.competitionId
      //       );

      //       break;
      //     case NotificationTypeEnum.ProductReservation:
      //       this.CompetitionService.getMyCompetitions();
      //       if (notification.title && isTapped) {
      //         if (additional.competitionId) {
      //           this.navController.navigateForward(
      //             `/tabs/my/event/${additional.competitionId}`
      //           );
      //         }
      //       }

      //       break;
      //     case NotificationTypeEnum.Comment:
      //       if (additional.competitionId) {
      //         this.navController.navigateForward(
      //           `/tabs/public/event/${additional.competitionId}`
      //         );
      //       }
      //       break;
      //   }
      // }
    });
  }
}
