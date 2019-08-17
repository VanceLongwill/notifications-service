import * as webpush from "web-push";
import * as express from "express";
import * as cors from "cors";

// database
import DB from "./db";
// config
import config from "./config";
// routes
import mapRoutes from "./routes";

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
// allow cross origin preflight requests for all routes
app.options("*", cors());

const port = process.env.PORT || 5000;

db.connect().then(() => {
  // setup routes
  mapRoutes(app, db, webpush, vapidKeys.publicKey);

  app.listen(port, () => {
    console.log(`
      ========================================================
        push notification service running on port ${port}
      ========================================================
    `);
  });
});

// listen for the signal interruption (ctrl-c)
process.on("SIGINT", () => {
  db.close();
  process.exit();
});
