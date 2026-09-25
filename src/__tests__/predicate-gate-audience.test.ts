import { describe, expect, it } from "vitest"
import {
  derivePredicateGateRecipient,
  normalizePredicateGateAudience,
} from "../lib/predicate-gate-audience.js"

const OPERATOR = "0x5ECA0441311643608a8c9Ab8B250f695Dd32E2a8" as const

describe("predicate gate audience binding", () => {
  it.each([
    {
      audience: "https://example.com/api",
      toolId: 42n,
      operatorAddress: OPERATOR,
      expected: "0x1a1D056f89d42c3B0fA2F69D3FBd5cF1b2ed0e15",
    },
    {
      audience: "https://example.com/api",
      toolId: 43n,
      operatorAddress: OPERATOR,
      expected: "0x59D1B333710A042Bbddb151DC779178ae9c02EaD",
    },
    {
      audience: "https://example.com/api",
      toolId: 42n,
      operatorAddress: "0x1111111111111111111111111111111111111111" as const,
      expected: "0xb00a8A4A42d2d1eFd2F7d87863402D647D72cBec",
    },
    {
      audience: "https://public.example/tools/secure",
      toolId: 42n,
      operatorAddress: OPERATOR,
      expected: "0xB82ed0c05C116396864d7Eee45814C868592f8Cc",
    },
  ])("derives the fixed recipient for $audience, tool $toolId, and $operatorAddress", ({
    expected,
    ...binding
  }) => {
    expect(derivePredicateGateRecipient(binding)).toBe(expected)
  })

  it("removes URL fragments before derivation", () => {
    expect(
      normalizePredicateGateAudience("https://example.com/api#ignored"),
    ).toBe("https://example.com/api")
    expect(
      derivePredicateGateRecipient({
        audience: "https://example.com/api#ignored",
        toolId: 42n,
        operatorAddress: OPERATOR,
      }),
    ).toBe("0x1a1D056f89d42c3B0fA2F69D3FBd5cF1b2ed0e15")
  })
})
