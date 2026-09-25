import { encodePacked, getAddress, keccak256 } from "viem"

const PREDICATE_GATE_RECIPIENT_DOMAIN = "opensea-predicate-gate-v1"

export interface PredicateGateAudienceBinding {
  /** Absolute public URL of the predicate-gated endpoint. */
  audience: string | URL
  /** Onchain tool ID enforced by the gate. */
  toolId: bigint
  /** Operator configured by the tool server. */
  operatorAddress: `0x${string}`
}

/**
 * Normalize the endpoint URL that a free predicate-gate authorization targets.
 * URL fragments are client-only and never reach the server, so they are not
 * part of the signed audience.
 */
export function normalizePredicateGateAudience(audience: string | URL): string {
  const url = new URL(audience)
  url.hash = ""
  return url.href
}

/**
 * Derive the recipient signed by free predicate-gate callers.
 *
 * EIP-3009 has no arbitrary audience field. Encoding the endpoint, tool ID,
 * and operator into `to` lets both the client and server verify the intended
 * audience without transferring funds. The address needs no private key
 * because the authorization value is required to be zero and is never settled.
 */
export function derivePredicateGateRecipient({
  audience,
  toolId,
  operatorAddress,
}: PredicateGateAudienceBinding): `0x${string}` {
  const digest = keccak256(
    encodePacked(
      ["string", "string", "uint256", "address"],
      [
        PREDICATE_GATE_RECIPIENT_DOMAIN,
        normalizePredicateGateAudience(audience),
        toolId,
        operatorAddress,
      ],
    ),
  )
  return getAddress(`0x${digest.slice(-40)}`)
}
