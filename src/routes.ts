import * as express from "express";

// middlewares
import saveSubscription from "./middlewares/saveSubscription";
import notifyAll from "./middlewares/notifyAll";
import notify from "./middlewares/notify";
import getVapidKey from "./middlewares/getVapidKey";

import { IDatabase, ISendNotfication } from "./types";

export default function mapRoutes(
  app: express.Application,
  db: IDatabase,
  notifcationService: ISendNotfication,
  pubKey: string
) {
  // Endpoint for the browser to send the subscriptions
  app.post("/save-subscription", saveSubscription(db));

  // Dispatch a notification to all subscribed users
  app.post("/notify-all", notifyAll(db, notifcationService));

  // Dispatch a notfication to a specific user/set of users
  app.post("/notify", notify(db, notifcationService));

  // Get the vapid key
  app.get("/vapid-key", getVapidKey(pubKey));
}
