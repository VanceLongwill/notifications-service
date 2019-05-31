import * as low from "lowdb";
import * as FileSync from "lowdb/adapters/FileSync";
import * as Memory from "lowdb/adapters/Memory";
import * as webpush from "web-push";

import { IDatabase, IUserSubscription, ISubscriptionsSchema } from "./types";

// Simple db layer fulfilling the IDatabase interface implemented with lowdb
export default class DB implements IDatabase {
  db: low.LowdbSync<ISubscriptionsSchema>;
  constructor() {
    const db = low(
      process.env.NODE_ENV === "test"
        ? new Memory("{}") // in memory db for testing
        : new FileSync("db.json")
    );

    // Migrate the db if it's empty
    db.defaults({
      subscriptions: []
    }).write();

    this.db = db;
  }

  // save the subcription to lowdb
  public saveSubscription(
    subscription: webpush.PushSubscription,
    id: string = null
  ) {
    const savedItem = this.db
      .get("subscriptions")
      .push({ subscription, id })
      .last()
      .write();
    return Promise.resolve(savedItem);
  }

  // get an array of subscriptions
  public getAllSubscriptions() {
    const subscriptions = this.db.get("subscriptions").value();
    return Promise.resolve(subscriptions);
  }

  // find all subscriptions with a certain user id
  public getSubscriptionsByID(id: string) {
    const foundItems = this.db
      .get("subscriptions")
      .filter({ id })
      .value();
    return Promise.resolve(foundItems);
  }

  public getSubscriptionsByURL(url: string) {
    const foundItems = this.db
      .get("subscriptions")
      .filter({
        subscription: {
          // endpoint is unique per user
          endpoint: url
        }
      })
      .value();
    return Promise.resolve(foundItems);
  }

  // remove a subscription
  public removeSubscription(subscription: IUserSubscription) {
    this.db
      .get("subscriptions")
      .pull(subscription)
      .write();
    return Promise.resolve("done");
  }

  public close() {
    // lowdb doesn't have a close function
    return Promise.resolve("Database connection closed");
  }
}
