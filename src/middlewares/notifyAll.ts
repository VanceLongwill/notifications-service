import * as express from "express";
import { IDatabase, ISendNotfication } from "../types";

// Send a notification to all currently subscribed clients
export default (
  db: IDatabase,
  notificationService: ISendNotfication
): express.Handler => async (req, res) => {
  if (!req.body.notification) {
    res.status(400);
    res.send({
      error: {
        message: "Request body must contain a valid notification object"
      }
    });
    return;
  }

  // @TODO: more refined error handling
  try {
    const subscriptions = await db.getAllSubscriptions();
    if (!subscriptions.length) {
      res.status(404);
      res.send({
        error: {
          message: "No subscriptions found"
        }
      });
      return;
    }
    // console.log(`
    //     Sending notification to ${subscriptions.length} users
    //     Notification message: ${notificationMessage}
    //   `);
    const failed: {
      endpoint: string;
      error: string;
    }[] = [];
    await Promise.all(
      subscriptions.map(subscription =>
        notificationService
          .sendNotification(
            subscription.subscription,
            JSON.stringify(req.body.notification)
          )
          .catch(e => {
            // @TODO: remove subscription endpoints which cause errors
            failed.push({
              endpoint: subscription.subscription.endpoint,
              error: e.message
            });
          })
      )
    );
    res.status(200);
    res.send({
      message: "Notifications sent",
      failed
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
