import * as low from "lowdb";
import * as FileSync from "lowdb/adapters/FileSync";
import * as Memory from "lowdb/adapters/Memory";
import * as webpush from "web-push";

// Generic interface for our db model
export interface IDatabase {
  // Store a subscription object for later use when sending notifications
  saveSubscription(
    subscription: webpush.PushSubscription
  ): Promise<webpush.PushSubscription>;
  // Retrieves a list of subscription objects
  getSubscriptions(): Promise<webpush.PushSubscription[]>;
  // Closes the database connection
  close(): Promise<string>;
}

// DB schema representation
interface ISubscriptionsSchema {
  subscriptions: webpush.PushSubscription[];
}

// Simple db layer fulfilling the IDatabase interface implemented with lowdb
export default class DB implements IDatabase {
  db: low.LowdbSync<ISubscriptionsSchema>;
  constructor() {
    const db = low(
      process.env.NODE_ENV === "test"
        ? new Memory("{}") // in memory db for testing
        : new FileSync("../db.json")
    );

    // Migrate the db if it's empty
    db.defaults({
      subscriptions: []
    }).write();

    this.db = db;
  }

  // save the subcription to lowdb
  public saveSubscription(subscription: webpush.PushSubscription) {
    const savedItem = this.db
      .get("subscriptions")
      .push(subscription)
      .last()
      .write();
    return Promise.resolve(savedItem)
  }

  // get an array of subscriptions
  public getSubscriptions() {
    const subscriptions = this.db.get("subscriptions").value();
    return Promise.resolve(subscriptions);
  }

  public close() {
    // lowdb doesn't have a close function
    return Promise.resolve("Database connection closed");
  }
}
