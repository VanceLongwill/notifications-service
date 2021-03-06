import * as webpush from "web-push";

// Generic interface for our db model
export interface IDatabase {
  // Store a subscription object for later use when sending notifications
  saveSubscription(
    subscription: webpush.PushSubscription,
    id?: string | null
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
  // Connects to the database
  connect(): Promise<void>;
}

// One user id can have multiple subscriptions for notifications (multiple browsers, devices) but each subscription object can only have one user id
export interface IUserSubscription {
  // push notification subscription
  subscription: webpush.PushSubscription;
  // corresponding user id
  id: string | null;
}

// DB schema representation
export interface ISubscriptionsSchema {
  subscriptions: IUserSubscription[];
}

// Function used to dispatch a push notification
export interface ISendNotfication {
  sendNotification(
    subscription: IUserSubscription["subscription"],
    message: string
  ): Promise<any>;
}

export interface IKeyPair {
  publicKey: string;
  privateKey: string;
}

export interface IConfig {
  vapidKeys: IKeyPair;
  vapidEmail: string;
  fcmApiKey: string;
}
