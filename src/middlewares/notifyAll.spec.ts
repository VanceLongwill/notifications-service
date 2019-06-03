import "mocha";
import { assert, expect } from "chai";
import * as sinon from "sinon";

import notifyAll from "./notifyAll";

import MockDB from "../__mocks__/db";
import { subscriptions } from "../__stubs__/subscriptions";

describe("notifyAll middleware", () => {
  let mockDB: MockDB;
  let middleware: ReturnType<typeof notifyAll>;
  let mockRes: {
    status: sinon.SinonSpy<any[], any>;
    send: sinon.SinonSpy<any[], any>;
  };
  let sendNotification: sinon.SinonStub<any[], any>;

  beforeEach(() => {
    mockDB = new MockDB();
    sendNotification = sinon.stub();
    middleware = notifyAll(mockDB, sendNotification);
    mockRes = {
      status: sinon.spy(),
      send: sinon.spy()
    };
  });

  it("should validate request payloads", async () => {
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

  it("should get all subscriptions on a successful request", async () => {
    const mockReq = {
      body: {
        message: "Some notifcation!"
      }
    };

    sendNotification.resolves({ body: "something" });
    mockDB.getAllSubscriptions.returns(subscriptions);

    await middleware(mockReq as any, mockRes as any);

    assert(mockDB.getAllSubscriptions.calledOnce);

    expect(sendNotification.getCalls()).to.have.length(
      subscriptions.length,
      "call send notification for each subscription"
    );

    assert(mockRes.status.calledOnce);
    expect(mockRes.status.firstCall.args[0]).to.equal(200);

    assert(mockRes.send.calledOnce);
    expect(mockRes.send.firstCall.args[0]).to.deep.equal({
      message: "Notifications sent"
    });
  });

  it("should send an error response when getAllSubscriptions fails", async () => {
    const mockReq = {
      body: {
        message: "Some notifcation!"
      }
    };

    sendNotification.resolves({ body: "something" });
    const errorMsg = "aaahhhhhhh";
    mockDB.getAllSubscriptions.rejects(new Error(errorMsg));

    await middleware(mockReq as any, mockRes as any);

    assert(mockDB.getAllSubscriptions.calledOnce);
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
});
