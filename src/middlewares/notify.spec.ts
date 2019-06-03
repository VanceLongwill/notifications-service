import "mocha";
import { assert, expect } from "chai";
import * as sinon from "sinon";

import notify from "./notify";

import MockDB from "../__mocks__/db";
import { subscriptions } from "../__stubs__/subscriptions";

describe("notify middleware", () => {
  let mockDB: MockDB;
  let middleware: ReturnType<typeof notify>;
  let mockRes: {
    status: sinon.SinonSpy<any[], any>;
    send: sinon.SinonSpy<any[], any>;
  };
  let sendNotification: sinon.SinonStub<any[], any>;

  beforeEach(() => {
    mockDB = new MockDB();
    sendNotification = sinon.stub();
    middleware = notify(mockDB, { sendNotification });
    mockRes = {
      status: sinon.spy(),
      send: sinon.spy()
    };
  });

  it("should not accept requests without a message", async () => {
    const mockReq = {
      body: {
        // no message
      }
    };

    await middleware(mockReq as any, mockRes as any);

    assert(mockRes.status.calledOnce);
    expect(mockRes.status.firstCall.args[0]).to.equal(400);

    assert(mockRes.send.calledOnce);
    expect(mockRes.send.firstCall.args[0]).to.deep.equal({
      error: {
        message: "Request body must contain a valid message attribute"
      }
    });
  });

  it("should not accept requests without a list of ids", async () => {
    const mockReq = {
      body: {
        message: "asdasd"
      }
    };

    await middleware(mockReq as any, mockRes as any);

    assert(mockRes.status.calledOnce);
    expect(mockRes.status.firstCall.args[0]).to.equal(400);

    assert(mockRes.send.calledOnce);
    expect(mockRes.send.firstCall.args[0]).to.deep.equal({
      error: {
        message: "Request body must contain a valid list of targets"
      }
    });
  });

  it("should send notifications for all subscriptions belonging to the target ids", async () => {
    const targetSubscriptions = subscriptions.slice(0, 3);
    const subscriptionsSlice = targetSubscriptions.concat(targetSubscriptions);
    const mockReq = {
      body: {
        message: "Some notifcation!",
        targets: targetSubscriptions.map(s => s.id)
      }
    };

    sendNotification.resolves({ body: "something" });

    mockDB.getSubscriptionsByID.callsFake((id: string) => {
      return Promise.resolve(subscriptionsSlice.filter(s => s.id === id));
    });

    await middleware(mockReq as any, mockRes as any);

    assert(mockDB.getSubscriptionsByID.calledThrice);
    expect(mockDB.getSubscriptionsByID.firstCall.args[0]).to.equal(
      subscriptionsSlice[0].id
    );
    expect(mockDB.getSubscriptionsByID.secondCall.args[0]).to.equal(
      subscriptionsSlice[1].id
    );
    expect(mockDB.getSubscriptionsByID.thirdCall.args[0]).to.equal(
      subscriptionsSlice[2].id
    );

    expect(sendNotification.getCalls()).to.have.length(
      subscriptionsSlice.length,
      "call send notification for each subscription"
    );

    assert(mockRes.status.calledOnce);
    expect(mockRes.status.firstCall.args[0]).to.equal(200);

    assert(mockRes.send.calledOnce);
    expect(mockRes.send.firstCall.args[0]).to.deep.equal({
      message: "Notifications sent"
    });
  });

  it("should send an error response when getSubscriptionsByID fails", async () => {
    const mockReq = {
      body: {
        message: "Some notifcation!",
        targets: ["asd"]
      }
    };

    sendNotification.resolves({ body: "something" });
    const errorMsg = "aaahhhhhhh";
    mockDB.getSubscriptionsByID.rejects(new Error(errorMsg));

    await middleware(mockReq as any, mockRes as any);

    assert(mockDB.getSubscriptionsByID.calledOnce);
    assert(sendNotification.notCalled);

    assert(mockRes.status.calledOnce);
    expect(mockRes.status.firstCall.args[0]).to.equal(500);

    assert(mockRes.send.calledOnce);
    expect(mockRes.send.firstCall.args[0]).to.deep.equal({
      message: "Unable to send notifications",
      error: {
        message: errorMsg
      }
    });
  });

  it("should send an error response when sendNotification fails for all subscriptions", async () => {
    const mockReq = {
      body: {
        message: "Some notifcation!",
        targets: ["asd"]
      }
    };

    const errorMsg = "aaahhhhhhh";
    mockDB.getSubscriptionsByID.resolves(subscriptions.slice(0, 3));
    sendNotification.rejects(new Error(errorMsg));

    await middleware(mockReq as any, mockRes as any);

    assert(mockDB.getSubscriptionsByID.calledOnce);
    assert(sendNotification.calledThrice);

    assert(mockRes.status.calledOnce);
    expect(mockRes.status.firstCall.args[0]).to.equal(500);

    assert(mockRes.send.calledOnce);
    expect(mockRes.send.firstCall.args[0]).to.deep.equal({
      message: "Unable to send notifications",
      error: {
        message: `No notifications were sent:\n${Array(3)
          .fill(errorMsg)
          .join("\n")}`
      }
    });
  });
});
