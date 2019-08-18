## Push notifications

A service to receive push notification subscriptions from the browser and to dispatch notifications to all subscribed users.

#### TODO

- [x] Send all possible notification options
- [ ] Validate notifications schema with joi & request schema
- [ ] Improve test coverage
- [ ] Manage consistently failing subscription endpoints

> This project uses a dotenv (`.env`) configuration file to load API keys

- Subscription objects are persisted to `db.json`

### Setup

- `npm i`
- `npm run dev` starts the dev server
- `NODE_ENV=test npm run dev` starts the dev server with in memory db

- `npm run build` compiles the project to js
- `npm run start` startes the compiled (production) server

### Endpoints

- **GET** `/vapid-key`

  ```sh
  curl localhost:5000/vapid-key
  ```

- **POST** `/save-subscription`

  ```sh
  curl -X POST -H "Content-type: application/json" \
    --data @samples/save-subscription-payload.json \
    localhost:5000/save-subscription
  ```

- **POST** `/notify-all`

  ```sh
  curl -X POST -H "Content-type: application/json" \
   --data @samples/notify-all-payload.json \
   localhost:5000/notify-all
  ```

- **POST** `/notify`

  ```sh
  curl -X POST -H "Content-type: application/json" \
   --data @samples/notify-payload.json \
   localhost:5000/notify
  ```
