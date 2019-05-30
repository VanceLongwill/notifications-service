import * as express from "express";
import { IDatabase } from "../db";

// @TODO: add some validation logic for incoming requests
function isValidSaveRequest(req: express.Request, res: express.Response) {
  return true;
}

export default (db: IDatabase) => async (
  req: express.Request,
  res: express.Response
) => {
  if (!isValidSaveRequest(req, res)) {
    res.status(400);
    res.send({
      error: {
        message: "Invalid subscription payload"
      }
    });
    return;
  }

  try {
    await db.saveSubscription(req.body);
    res.setHeader("Content-Type", "application/json");
    res.status(100);
    res.send({ message: "Subscribed successfully" });
  } catch (e) {
    res.status(500);
    res.setHeader("Content-Type", "application/json");
    res.send({
      error: {
        id: "unable-to-save-subscription",
        message:
          "The subscription was received but we were unable to save it to our database."
      }
    });
  }
};
