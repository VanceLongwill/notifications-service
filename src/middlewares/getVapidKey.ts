import * as express from "express";

// Get the VAPID public key in order to subscribe to push notifications
// VAPID key works cross platform with newer browsers
export default (vapidKey: string): express.Handler => (_, res) => {
  res.status(200);
  res.send({
    VAPID_KEY: vapidKey
  });
};
