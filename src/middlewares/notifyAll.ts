import * as express from "express";
import { IDatabase, IUserSubscription } from "../types";

type ISendNotfication = (
  subscription: IUserSubscription["subscription"],
  message: string
) => Promise<any>;

// Send a notification to all currently subscribed clients
export default (db: IDatabase, sendNotification: ISendNotfication) => async (
  req: express.Request,
  res: express.Response
) => {
  const notificationMessage: string = req.body.message;

  if (!notificationMessage) {
    res.status(400);
    res.send({
      error: {
        message: "Request body must contain a valid message attribute"
      }
    });
    return;
  }

  try {
    const subscriptions = await db.getAllSubscriptions();
    // console.log(`
    //     Sending notification to ${subscriptions.length} users
    //     Notification message: ${notificationMessage}
    //   `);
    subscriptions.forEach(async subscription => {
      try {
        await sendNotification(subscription.subscription, notificationMessage);
      } catch (e) {
        // @TODO: remove subscription endpoints which cause errors
        console.warn(e.message);
      }
    });
    res.status(200);
    res.send({
      message: "Notifications sent"
    });
  } catch (e) {
    res.status(500);
    res.send({
      message: "Unable to send notifications",
      error: {
        message: e.message
      }
    });
  }
};
