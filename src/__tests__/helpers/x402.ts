/**
 * Shared builder for the base64 x402 v1 `X-Payment` header that the gate specs
 * feed to `predicateGate` and `paidPredicateGate`.
 *
 * The gates decode this header, so its shape has to keep matching what a real
 * x402 client sends. With one builder a shape change is a single edit, and the
 * specs cannot quietly drift apart into passing against a payload no client
 * produces.
 *
 * Test-tree only. This is deliberately not in `src/testing/`, which is the
 * published `./testing` subpath.
 */

/** Authorization fields a single call overrides, e.g. `{ value: "1000000" }`. */
export type AuthorizationOverrides = Record<string, unknown>

export interface XPaymentHeaderDefaults {
  /** `authorization.from`: the address that signed the transfer. */
  from: string
  /** `authorization.to`: the address being paid. */
  to: string
  /** `authorization.value` in atomic units. Defaults to "0". */
  value?: string
  /** x402 network identifier. Defaults to "base". */
  network?: string
}

/**
 * Builds a header. `overrides` merge into the authorization object; `network`
 * overrides the default network for one call.
 */
export type XPaymentHeaderBuilder = (
  overrides?: AuthorizationOverrides,
  network?: string,
) => string

const NONCE =
  "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef"
const SIGNATURE = "0xabcd"
/** Seconds of validity ahead of now, inside the gates' one hour cap. */
const VALID_FOR_SECONDS = 300

/** Binds a spec's own addresses and amount, then returns its header builder. */
export function createXPaymentHeaderBuilder({
  from,
  to,
  value = "0",
  network: defaultNetwork = "base",
}: XPaymentHeaderDefaults): XPaymentHeaderBuilder {
  return (overrides = {}, network = defaultNetwork) => {
    const authorization = {
      from,
      to,
      value,
      validAfter: "0",
      validBefore: String(Math.floor(Date.now() / 1000) + VALID_FOR_SECONDS),
      nonce: NONCE,
      ...overrides,
    }
    const payload = {
      x402Version: 1,
      scheme: "exact",
      network,
      payload: {
        signature: SIGNATURE,
        authorization,
      },
    }
    return Buffer.from(JSON.stringify(payload)).toString("base64")
  }
}
