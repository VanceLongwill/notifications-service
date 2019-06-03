import * as express from "express";
import { IDatabase, ISendNotfication } from "../types";

function isNotifyRequestValid(
  req: express.Request,
  res: express.Response
): boolean {
  if (!req.body.message) {
    res.status(400);
    res.send({
      error: {
        message: "Request body must contain a valid message attribute"
      }
    });
    return false;
  }
  if (!req.body.targets || req.body.targets.length < 1) {
    res.status(400);
    res.send({
      error: {
        message: "Request body must contain a valid list of targets"
      }
    });
    return false;
  }
  return true;
}

// Send a notification to all currently subscribed clients
export default (db: IDatabase, notificationService: ISendNotfication) => async (
  req: express.Request,
  res: express.Response
) => {
  if (!isNotifyRequestValid(req, res)) {
    return;
  }

  const notificationMessage: string = req.body.message;
  const targetIDs: string[] = req.body.targets;

  try {
    for (const targetID of targetIDs) {
      const subscriptions = await db.getSubscriptionsByID(targetID);
      if (!subscriptions.length) {
        console.log(`Unable to find subscription for id: ${targetID}`);
        break;
      }
      const sendErrors: Error[] = [];
      for (const s of subscriptions) {
        await notificationService
          .sendNotification(s.subscription, notificationMessage)
          .catch(e => {
            sendErrors.push(e);
          });
      }
      if (sendErrors.length === subscriptions.length) {
        throw new Error(
          `No notifications were sent:\n${sendErrors
            .map(e => e.message)
            .join("\n")}`
        );
      }
    }

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
