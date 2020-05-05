import { Subscription, Observable } from "rxjs";
import { OnDestroy } from "@angular/core";

export class BaseComponent implements OnDestroy {
  private _subscriptions: Subscription[] = [];
  public ngOnDestroy(): void {
    for (let sub of this._subscriptions) {
      sub.unsubscribe();
    }
  }

  public markForSafeDelete(sub: any) {
    this._subscriptions.push(sub);
  }
}

export function safeSubscribe<T>(
  this: Observable<T>,
  component: BaseComponent,
  next?: (value: T) => void,
  error?: (error: T) => void,
  complete?: () => void
): Subscription {
  let sub = this.subscribe(next, error, complete);
  component.markForSafeDelete(sub);
  return sub;
}
Observable.prototype.safeSubscribe = safeSubscribe;

declare module "rxjs/internal/Observable" {
  interface Observable<T> {
    safeSubscribe: typeof safeSubscribe;
  }
}
