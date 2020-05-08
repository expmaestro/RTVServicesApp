import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  isLoading = false;
  loading: any;
  constructor(private loadingController: LoadingController) { }

  async loadingPresent() {
    if (!this.isLoading) {
      this.isLoading = true;

      await this.loadingController.create({
        message: 'Пожалуйста подождите...'
      }).then((a) => a.present());
    }
  }

  async loadingDismiss() {
    if (this.isLoading) {
      this.isLoading = false;
      return await this.loadingController.getTop().then(a => {
        if (a)
          a.dismiss().then(() => console.log('loading dismissed'));
      });
    }

  }
}
