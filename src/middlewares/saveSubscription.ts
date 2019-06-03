import * as express from "express";
import { IDatabase } from "../types";

function isValidSaveRequest(req: express.Request, res: express.Response) {
  const subscription = req.body.subscription;
  try {
    if (!subscription) {
      throw Error(`No subscription in payload`);
    }
    if (!subscription.endpoint) {
      throw Error(`No endpoint in subcription payload`);
    }
    if (
      !subscription.keys ||
      !subscription.keys.p256dh ||
      !subscription.keys.auth
    ) {
      throw Error(`No public and/or auth keys in subcription payload`);
    }
  } catch (e) {
    res.status(400);
    res.send({
      message: "Invalid subscription payload",
      error: {
        message: e.message
      }
    });
    return false;
  }
  return true;
}

export default (db: IDatabase) => async (
  req: express.Request,
  res: express.Response
) => {
  if (!isValidSaveRequest(req, res)) {
    return;
  }

  try {
    if (req.body.id) {
      const foundSubscriptions = await db.getSubscriptionsByID(req.body.id);
      // check if we've already received the user's subscription
      const isAlreadySaved = foundSubscriptions.some(
        userSubscription =>
          // check if this client's endpoint matches the existing entry
          userSubscription.subscription.endpoint ===
          req.body.subscription.endpoint
      );

      if (isAlreadySaved) {
        res.status(200);
        res.send({ message: "Already subscribed" });
        return;
      }
    }
    // check if this client's endpoint has already been registered
    const foundSubscriptions = await db.getSubscriptionsByURL(
      req.body.subscription.endpoint
    );

    if (foundSubscriptions.length > 0) {
      if (foundSubscriptions.length > 1) {
        console.warn(
          `Found duplicate subscriptions for url: ${
            req.body.subscription.endpoint
          }`
        );
      } else if (foundSubscriptions[0].id === null && !req.body.id) {
        // anonymous subscription is already saved
        res.status(200);
        res.send({ message: "Already subscribed" });
        return;
      }
      // remove subscriptions using the same client
      // this means that users must stay logged in to keep receiving notifications
      await Promise.all(foundSubscriptions.map(db.removeSubscription));
    }

    await db.saveSubscription(req.body);
    res.status(200);
    res.send({ message: "Subscribed successfully" });
  } catch (e) {
    res.status(500);
    res.send({
      message:
        "The subscription was received but we were unable to save it to our database.",
      error: { message: e.message }
    });
  }
};
