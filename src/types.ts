import * as webpush from "web-push";

// Generic interface for our db model
export interface IDatabase {
  // Store a subscription object for later use when sending notifications
  saveSubscription(
    subscription: webpush.PushSubscription
  ): Promise<IUserSubscription>;
  // Retrieves a list of subscription objects
  getAllSubscriptions(): Promise<IUserSubscription[]>;
  // Retrieves a list of subscriptions for a user
  getSubscriptionsByID(id: string): Promise<IUserSubscription[]>;
  // Retrieves a list of subscriptions for a certain endpoint url
  getSubscriptionsByURL(url: string): Promise<IUserSubscription[]>;
  // Delete a subscription
  removeSubscription(subscription: IUserSubscription): Promise<string>;
  // Closes the database connection
  close(): Promise<string>;
}

// One user id can have multiple subscriptions for notifications (multiple browsers, devices) but each subscription object can only have one user id
export interface IUserSubscription {
  // push notification subscription
  subscription: webpush.PushSubscription;
  // corresponding user id
  id: string;
}

// DB schema representation
export interface ISubscriptionsSchema {
  subscriptions: IUserSubscription[];
}
