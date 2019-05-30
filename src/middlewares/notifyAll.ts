import * as express from "express";
import * as webpush from "web-push";
import { IDatabase } from "../db";

// Send a notification to all currently subscribed clients
export default (db: IDatabase) => async (
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
    const subscriptions = await db.getSubscriptions();
    console.log(`
        Sending notification to ${subscriptions.length} users
        Notification message: ${notificationMessage}
      `);
    subscriptions.forEach(async subscription => {
      try {
        const res = await webpush.sendNotification(
          subscription,
          notificationMessage
        );
        console.log(res.body);
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
      error: {
        message: "Unable to send notifications"
      }
    });
  }
};
