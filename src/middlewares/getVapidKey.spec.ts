import "mocha";
import { assert, expect } from "chai";
import * as sinon from "sinon";

import getVapidKey from "./getVapidKey";

describe("getVapidKey middleware", () => {
  it("should give the correct response", async () => {
    const vapidKey = "some-key";
    const middleware = getVapidKey(vapidKey);
    const mockRes = {
      status: sinon.spy(),
      send: sinon.spy()
    };
    await middleware({} as any, mockRes as any, () => {});

    assert(mockRes.status.calledOnce);
    expect(mockRes.status.firstCall.args[0]).to.equal(200);

    assert(mockRes.send.calledOnce);
    expect(mockRes.send.firstCall.args[0]).to.deep.equal({
      VAPID_KEY: vapidKey
    });
  });
});
