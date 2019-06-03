import "mocha";
import { assert, expect } from "chai";
import * as sinon from "sinon";

import saveSubscription from "./saveSubscription";

import MockDB from "../__mocks__/db";
import { subscriptions } from "../__stubs__/subscriptions";

describe("saveSubscription middleware", () => {
  let mockDB: MockDB;
  let middleware: ReturnType<typeof saveSubscription>;
  let mockRes: {
    status: sinon.SinonSpy<any[], any>;
    send: sinon.SinonSpy<any[], any>;
  };

  beforeEach(() => {
    mockDB = new MockDB();
    middleware = saveSubscription(mockDB);
    mockRes = {
      status: sinon.spy(),
      send: sinon.spy()
    };
  });

  it("should validate request payloads", async () => {
    const payloadTests = [
      {
        payload: {},
        expectedErrorMessage: "No subscription in payload"
      },
      {
        payload: {
          subscription: { keys: { p256dh: "asdasd", auth: "asdasd" } }
        },
        expectedErrorMessage: "No endpoint in subcription payload"
      },
      {
        payload: {
          subscription: { endpoint: "asdasd", keys: { auth: "asdasd" } }
        },
        expectedErrorMessage:
          "No public and/or auth keys in subcription payload"
      }
    ];

    for (const t of payloadTests) {
      const mockReq = { body: t.payload };
      await middleware(mockReq as any, mockRes as any);

      assert(mockRes.status.calledOnce);
      expect(mockRes.status.firstCall.args[0]).to.equal(400);

      assert(mockRes.send.calledOnce);
      expect(mockRes.send.firstCall.args[0]).to.deep.equal({
        message: "Invalid subscription payload",
        error: {
          message: t.expectedErrorMessage
        }
      });

      mockRes.status.resetHistory();
      mockRes.send.resetHistory();
    }
  });

  it("should notify if the subscription has already been saved when an id is provided", async () => {
    const mockReq = {
      body: {
        id: subscriptions[3].id,
        subscription: subscriptions[3].subscription
      }
    };

    mockDB.getSubscriptionsByID.returns([subscriptions[3]]);
    mockDB.getSubscriptionsByURL.returns([subscriptions[3]]);

    await middleware(mockReq as any, mockRes as any);

    assert(
      mockDB.getSubscriptionsByID.calledOnce,
      "should fetch existing subscriptions for the id"
    );
    expect(mockDB.getSubscriptionsByID.firstCall.args[0]).to.equal(
      subscriptions[3].id
    );

    assert(mockDB.getSubscriptionsByURL.notCalled);

    assert(
      mockDB.removeSubscription.notCalled,
      "should not remove existing subscription"
    );

    assert(mockDB.saveSubscription.notCalled);

    assert(mockRes.status.calledOnce);
    expect(mockRes.status.firstCall.args[0]).to.equal(200);

    assert(mockRes.send.calledOnce);
    expect(mockRes.send.firstCall.args[0]).to.deep.equal({
      message: "Already subscribed"
    });
  });

  it("should notify if an anonymous subscription has already been saved", async () => {
    const subscriptionWithoutID = {
      ...subscriptions[3],
      id: null
    };
    const mockReq = {
      body: {
        subscription: subscriptions[3].subscription
      }
    };

    mockDB.getSubscriptionsByURL.returns([subscriptionWithoutID]);

    await middleware(mockReq as any, mockRes as any);

    assert(
      mockDB.getSubscriptionsByURL.calledOnce,
      "should fetch existing subscriptions for the endpoint"
    );
    expect(mockDB.getSubscriptionsByURL.firstCall.args[0]).to.equal(
      subscriptions[3].subscription.endpoint
    );

    assert(
      mockDB.removeSubscription.notCalled,
      "should not remove existing subscription"
    );

    assert(mockDB.saveSubscription.notCalled);

    assert(mockRes.status.calledOnce);
    expect(mockRes.status.firstCall.args[0]).to.equal(200);

    assert(mockRes.send.calledOnce);
    expect(mockRes.send.firstCall.args[0]).to.deep.equal({
      message: "Already subscribed"
    });
  });

  it("should replace an anonymous subscription if an id is provided", async () => {
    const mockReq = {
      body: {
        id: subscriptions[3].id,
        subscription: subscriptions[3].subscription
      }
    };

    const subscriptionWithoutID = {
      ...subscriptions[3],
      id: null
    };

    mockDB.getSubscriptionsByID.returns([]);
    mockDB.getSubscriptionsByURL.returns([subscriptionWithoutID]);

    await middleware(mockReq as any, mockRes as any);

    assert(mockDB.getSubscriptionsByID.calledOnce);

    assert(
      mockDB.getSubscriptionsByURL.calledOnce,
      "should fetch existing subscriptions for the endpoint"
    );
    expect(mockDB.getSubscriptionsByURL.firstCall.args[0]).to.equal(
      subscriptions[3].subscription.endpoint
    );

    assert(
      mockDB.removeSubscription.calledOnce,
      "should remove existing subscription"
    );
    expect(mockDB.removeSubscription.firstCall.args[0]).to.deep.equal(
      subscriptionWithoutID
    );

    assert(mockDB.saveSubscription.calledOnce);
    expect(mockDB.saveSubscription.firstCall.args[0]).to.deep.equal(
      mockReq.body
    );

    assert(mockRes.status.calledOnce);
    expect(mockRes.status.firstCall.args[0]).to.equal(200);

    assert(mockRes.send.calledOnce);
    expect(mockRes.send.firstCall.args[0]).to.deep.equal({
      message: "Subscribed successfully"
    });
  });

  it("should replace a subscription when a new id is provided", async () => {
    const mockReq = {
      body: {
        id: "new-id-here",
        subscription: subscriptions[3].subscription
      }
    };

    mockDB.getSubscriptionsByID.returns([]);
    mockDB.getSubscriptionsByURL.returns([subscriptions[3]]);

    await middleware(mockReq as any, mockRes as any);

    assert(mockDB.getSubscriptionsByID.calledOnce);

    assert(
      mockDB.getSubscriptionsByURL.calledOnce,
      "should fetch existing subscriptions for the endpoint"
    );
    expect(mockDB.getSubscriptionsByURL.firstCall.args[0]).to.equal(
      subscriptions[3].subscription.endpoint
    );

    assert(
      mockDB.removeSubscription.calledOnce,
      "should remove existing subscription"
    );
    expect(mockDB.removeSubscription.firstCall.args[0]).to.deep.equal(
      subscriptions[3]
    );

    assert(mockRes.status.calledOnce);
    expect(mockRes.status.firstCall.args[0]).to.equal(200);

    assert(mockRes.send.calledOnce);
    expect(mockRes.send.firstCall.args[0]).to.deep.equal({
      message: "Subscribed successfully"
    });
  });

  it("should add a new subscription when a new endpoint and existing id are provided", async () => {
    const mockReq = {
      body: {
        id: subscriptions[3].id,
        subscription: {
          ...subscriptions[3].subscription,
          endpoint: "http://some.new.endpoint/asd92n9a"
        }
      }
    };

    mockDB.getSubscriptionsByID.returns([subscriptions[3]]);
    mockDB.getSubscriptionsByURL.returns([]);

    await middleware(mockReq as any, mockRes as any);

    assert(mockDB.getSubscriptionsByURL.calledOnce);

    assert(
      mockDB.getSubscriptionsByID.calledOnce,
      "should fetch existing subscriptions for the id"
    );
    expect(mockDB.getSubscriptionsByID.firstCall.args[0]).to.equal(
      subscriptions[3].id
    );

    assert(
      mockDB.removeSubscription.notCalled,
      "should not remove the existing subscription"
    );

    assert(mockDB.saveSubscription.calledOnce);
    expect(mockDB.saveSubscription.firstCall.args[0]).to.deep.equal(
      mockReq.body
    );

    assert(mockRes.status.calledOnce);
    expect(mockRes.status.firstCall.args[0]).to.equal(200);

    assert(mockRes.send.calledOnce);
    expect(mockRes.send.firstCall.args[0]).to.deep.equal({
      message: "Subscribed successfully"
    });
  });

  it("should send an error response when a db method throws", async () => {
    const mockReq = {
      body: {
        id: subscriptions[3].id,
        subscription: subscriptions[3].subscription
      }
    };

    const errorMsg = "aaahhhhhhh";
    mockDB.getSubscriptionsByID.rejects(new Error(errorMsg));

    await middleware(mockReq as any, mockRes as any);

    assert(mockDB.getSubscriptionsByID.calledOnce);

    assert(mockRes.status.calledOnce);
    expect(mockRes.status.firstCall.args[0]).to.equal(500);

    assert(mockRes.send.calledOnce);
    expect(mockRes.send.firstCall.args[0]).to.deep.equal({
      message:
        "The subscription was received but we were unable to save it to our database.",
      error: {
        message: errorMsg
      }
    });
  });
});
