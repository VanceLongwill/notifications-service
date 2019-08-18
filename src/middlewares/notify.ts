import * as express from "express";
import { IDatabase, ISendNotfication } from "../types";

function isNotifyRequestValid(
  req: express.Request,
  res: express.Response
): boolean {
  if (!req.body.notification) {
    res.status(400);
    res.send({
      error: {
        message: "Request body must contain a valid notification object"
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
export default (
  db: IDatabase,
  notificationService: ISendNotfication
): express.Handler => async (req, res) => {
  if (!isNotifyRequestValid(req, res)) {
    return;
  }

  const targetIDs: string[] = req.body.targets;

  try {
    const results = await Promise.all(
      targetIDs.map(async targetID => {
        const subscriptions = await db.getSubscriptionsByID(targetID);
        const failed: {
          endpoint?: string;
          error: string;
        }[] = [];
        if (!subscriptions.length) {
          failed[0].error = `Unable to find subscription for id: ${targetID}`;
          return { id: targetID, failed };
        }
        await Promise.all(
          subscriptions.map(s =>
            notificationService
              .sendNotification(
                s.subscription,
                JSON.stringify(req.body.notification)
              )
              .catch(e => {
                failed.push({
                  endpoint: s.subscription.endpoint,
                  error: e.message
                });
              })
          )
        );

        return { id: targetID, failed };
      })
    );

    res.status(200);
    res.send({
      message: "Notifications sent",
      results
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
