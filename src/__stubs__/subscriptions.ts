import { IUserSubscription } from "../types";
import * as crypto from "crypto";

export function generateSubscriptions(n = 10): IUserSubscription[] {
  return Array(n)
    .fill({})
    .map(_ => ({
      id: crypto.randomBytes(7).toString("hex"),
      subscription: {
        endpoint: `https://some.pushservice.com/${crypto
          .randomBytes(7)
          .toString("hex")}`,
        keys: {
          p256dh: crypto.randomBytes(20).toString("hex"),
          auth: crypto.randomBytes(5).toString("hex")
        }
      }
    }));
}

export const subscriptions: IUserSubscription[] = [
  {
    id: "a51ad5ae21b6d4",
    subscription: {
      endpoint: "https://some.pushservice.com/4c9046ad66c7e3",
      keys: {
        p256dh: "e538a3fe9d8eb1e4bb2d18ba725e9a57eca784b2",
        auth: "07cf6c4bf1"
      }
    }
  },
  {
    id: "8c23ab692e28a1",
    subscription: {
      endpoint: "https://some.pushservice.com/b669712104c15f",
      keys: {
        p256dh: "f5b11901013efce5dfe51ab793b7824d152ae45c",
        auth: "3c444b24b1"
      }
    }
  },
  {
    id: "a14a9d5794ea4f",
    subscription: {
      endpoint: "https://some.pushservice.com/6ab4ef145a7a00",
      keys: {
        p256dh: "3a5a6de4e8d83b9c5f2d3a32ceadb64dd3f1ec5b",
        auth: "62fcffda22"
      }
    }
  },
  {
    id: "0962132052dc65",
    subscription: {
      endpoint: "https://some.pushservice.com/71af9970ee0330",
      keys: {
        p256dh: "cec4ecae7f6f4c2a698ab21889f795b2c840ced7",
        auth: "745900f9d7"
      }
    }
  },
  {
    id: "93f103d6e3b5e1",
    subscription: {
      endpoint: "https://some.pushservice.com/16affcf77c252e",
      keys: {
        p256dh: "e14b7e781f8ff865d0aec5029f0717501940abf8",
        auth: "0a5a404592"
      }
    }
  },
  {
    id: "18dfacfca64cec",
    subscription: {
      endpoint: "https://some.pushservice.com/bda6c91d76c6d7",
      keys: {
        p256dh: "fe1e60e8b5a69869e63b3eafe2dc16fc4f4d22c4",
        auth: "f9aabe0ae5"
      }
    }
  },
  {
    id: "eb409d5766ac1c",
    subscription: {
      endpoint: "https://some.pushservice.com/828e64448285bc",
      keys: {
        p256dh: "c18613775c82c976b14b2276752995472553ba8e",
        auth: "803e1686c8"
      }
    }
  },
  {
    id: "6a01cd82991c1b",
    subscription: {
      endpoint: "https://some.pushservice.com/2816d73120754d",
      keys: {
        p256dh: "b5bd0af1e616b54d26bc0a3102c7b40ba8c8bb6f",
        auth: "ae00434181"
      }
    }
  },
  {
    id: "80b5091d1d7df2",
    subscription: {
      endpoint: "https://some.pushservice.com/363a3657c1041d",
      keys: {
        p256dh: "e16fec6bf5c69d13a9dfa13ecf763d43d914cb98",
        auth: "09243747ae"
      }
    }
  },
  {
    id: "f69f8649c4b220",
    subscription: {
      endpoint: "https://some.pushservice.com/b90e74b6f559ab",
      keys: {
        p256dh: "8e10c17090c6790a3910c652aca0c2affb51976f",
        auth: "faa54fa34a"
      }
    }
  }
];
