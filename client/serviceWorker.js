self.addEventListener("push", e => {
  e.waitUntil(
    self.clients.matchAll().then(() => {
      if (!e.data) {
        console.log("Push notification has no payload!");
        return;
      }

      const data = e.data.json();

      const options = {
        body: data.body,
        icon: data.icon ? data.icon : "",
        image: data.image ? data.image : "",
        data: {
          url: data.url,
          dateOfArrival: Date.now(),
          actionMap: data.data.actionMap
        },
        vibrate: [100, 50, 100]
      };

      if (data.actions) {
        options.actions = data.actions;
      }

      return self.registration.showNotification(data.title, options);
    })
  );
});

self.addEventListener("notificationclick", event => {
  // fallback target url
  let targetURL = event.notification.data.url || "http://localhost:3000";

  if (event.action) {
    // dynamic target urls from notification data payload
    if (event.notification.data && event.notification.data.actionMap) {
      targetURL = event.notification.data.actionMap[event.action];
    } else {
      switch (event.action) {
        case "someCustomActionName":
          targetURL = "http://localhost:3000/my-account?someCustomActionName";
          break;
        default:
          console.log(`Unknown notification action ${event.action}`);
          break;
      }
    }
  }

  event.waitUntil(
    self.clients.matchAll({ includeUncontrolled: true }).then(clientList => {
      if (clientList.length > 0) {
        // find open windows matching the target url
        const matchedWindow = clientList.find(
          client => client.url === targetURL
        );
        if (matchedWindow) {
          // focus window if already open
          return matchedWindow.focus();
        }
      }
      // open a new window if none are already open
      return self.clients.openWindow(targetURL);
    })
  );
});

// subscribe again on expiry
self.addEventListener("pushsubscriptionchange", e => {
  e.waitUntil(
    self.registration.pushManager
      .subscribe({ userVisibleOnly: true })
      .then(subscription => {
        // this url has to be hardcoded for now
        return fetch("https://localhost:5000/save-subscription", {
          method: "POST",
          mode: "cors",
          headers: {
            "Content-type": "application/json"
          },
          body: JSON.stringify(subscription)
        });
      })
  );
});
