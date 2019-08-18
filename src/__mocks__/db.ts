import * as sinon from "sinon";

import { IDatabase } from "../types";

export default class DBMock implements IDatabase {
  saveSubscription = sinon.stub();
  getAllSubscriptions = sinon.stub();
  getSubscriptionsByID = sinon.stub();
  getSubscriptionsByURL = sinon.stub();
  removeSubscription = sinon.stub();
  close = sinon.stub();
  connect = sinon.stub();
}
