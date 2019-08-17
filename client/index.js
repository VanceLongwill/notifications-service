function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const GRANTED = "granted";

function getChromeVersion() {
  const raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
  return raw ? parseInt(raw[2], 10) : false;
}

function areNotificationsSupported() {
  return "Notification" in window && navigator.serviceWorker;
}
function arePushNotificationsSupported() {
  return "PushManager" in window;
}
function hasNotificationsPermission() {
  return Notification.permission === GRANTED;
}

function getNotificationPermission() {
  return new Promise((resolve, reject) => {
    if (!areNotificationsSupported()) {
      return reject("Notifications are not supported");
    }
    if (hasNotificationsPermission()) {
      return resolve(true);
    }
    const permissionHandler = status => {
      resolve(status === GRANTED);
    };
    // handle callback API
    const permissionResult = Notification.requestPermission(permissionHandler);
    // handle promise API
    if (permissionResult) {
      permissionResult.then(permissionHandler);
    }
  });
}

function handleSubscribe(registration) {
  if (getChromeVersion() < 52) {
    // @TODO: handle old chrome with FCM id
    return;
  }

  // Check if we're on an unsupported browser e.g. safari
  if (!registration.pushManager) {
    if (window.safari && window.safari.pushManager) {
      // @TODO: handle apple/safari notifications
    }
    return;
  }

  fetch("http://localhost:5000/vapid-key")
    .then(res => res.json())
    .then(res => {
      const { VAPID_KEY } = res;
      const subscribeOptions = {
        applicationServerKey: urlBase64ToUint8Array(VAPID_KEY),
        userVisibleOnly: true
      };

      registration.pushManager
        .subscribe(subscribeOptions)
        .then(subscription => {
          const subscriptionPayload = { subscription };

          const id = "some-user-id";

          if (id) {
            subscriptionPayload.id = id;
          }

          fetch("http://localhost:5000/save-subscription", {
            method: "POST",
            mode: "cors",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(subscriptionPayload)
          })
            .then(res => {
              console.log("Subscribed to notifications", res);
            })
            .catch(e => {
              console.warn(
                "Unable to subscribe to push notifications: ",
                e.message
              );
            });
        })
        .catch(e => {
          console.error(
            `An error occured trying to fetch the VAPID public key`,
            e
          );
        });
    });
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function() {
    navigator.serviceWorker.register("/serviceWorker.js").then(
      registration => {
        console.log(
          "ServiceWorker registration successful with scope: ",
          registration.scope
        );
        getNotificationPermission()
          .then(hasPermission => {
            if (hasPermission) {
              console.log("Got permission, subscribing to notifications");
              navigator.serviceWorker.ready.then(handleSubscribe).catch(e => {
                console.log("error waiting for service worker", e);
              });
            } else {
              console.log("Permission denied");
            }
          })
          .catch(e => {
            console.log("Failed to get notification permissions", e);
          });
      },
      err => {
        console.log("ServiceWorker registration failed: ", err);
      }
    );
  });
}
