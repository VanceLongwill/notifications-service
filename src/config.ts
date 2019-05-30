import * as webpush from "web-push";

interface IConfig {
  vapidKeys: webpush.VapidKeys;
  vapidEmail: string;
  fcmApiKey: string;
}

// check if the necessary env vars are present and return them
function getConfig(): IConfig {
  const vapidPubKey = process.env.VAPID_PUB_KEY;
  const vapidPrivKey = process.env.VAPID_PRIV_KEY;

  let vapidKeys: webpush.VapidKeys;

  if (vapidPubKey) {
    if (!vapidPrivKey) {
      throw new Error(
        `VAPID_PUB_KEY is present but not the corresponding VAPID_PRIV_KEY`
      );
    }
    vapidKeys = {
      publicKey: vapidPubKey,
      privateKey: vapidPrivKey
    };
  } else {
    // VAPID keys should only be generated only once.
    vapidKeys = webpush.generateVAPIDKeys();
    console.log(`
    GENERATED NEW VAPID KEYS (store these in the .env file):
      Public: ${vapidKeys.publicKey}
      Private: ${vapidKeys.privateKey}
    `);
  }

  const fcmApiKey = process.env.FCM_PUB_KEY;

  if (!fcmApiKey) {
    throw new Error(
      `Expected a FCM_PUB_KEY environment variable to be present`
    );
  }

  const vapidEmail = process.env.VAPID_EMAIL;
  if (!vapidEmail) {
    throw new Error(
      `Expected a VAPID_EMAIL environment variable to be present`
    );
  }

  return {
    vapidKeys,
    fcmApiKey,
    vapidEmail
  };
}

export default getConfig();
