import * as webpush from "web-push";
import * as express from "express";
import * as cors from "cors";

// database
import DB from "./db";

// middlewares
import saveSubscription from "./middlewares/saveSubscription";
import notifyAll from "./middlewares/notifyAll";
import getVapidKey from "./middlewares/getVapidKey";

// config
import config from "./config";

const { vapidKeys, fcmApiKey, vapidEmail } = config;

// webpush setup
webpush.setGCMAPIKey(fcmApiKey);
webpush.setVapidDetails(
  `mailto:${vapidEmail}`,
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// initialise db
const db = new DB();

const app = express();


// express JSON req/res middleware
app.use(express.json());
// setup cross origin headers for all routes
app.use(cors());
app.options("*", cors());

// Endpoint for the browser to send the subscriptions
app.post("/save-subscription", saveSubscription(db));

// Dispatch a notification to all subscribed users
app.post("/notify-all", notifyAll(db));

// Get the vapid key
app.get("/vapid-key", getVapidKey(vapidKeys.publicKey));

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`
      ========================================================
        push notification service running on port ${port}
      ========================================================
    `);
});

// listen for the signal interruption (ctrl-c)
process.on("SIGINT", () => {
  db.close();
  process.exit();
});
