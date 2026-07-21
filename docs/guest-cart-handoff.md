---
id: guest-cart-handoff
title: Guest Cart Handoff
sidebar_position: 4
---

# Guest Cart Handoff

Lets an external integrator build a cart on the shopper's behalf (e.g. a configurator, marketplace, or quoting tool on a partner site) and hand it off to the Unique Flooring storefront with the items pre-populated, without the shopper needing an account.

The flow has three steps:

1. An admin issues your integration an API key (`createExternalIntegrator`, admin-only — you don't call this).
2. Your backend calls `createGuestCartHandoff` with the items to add, authenticated with that API key. You get back a `redirectUrl`.
3. You redirect the shopper's browser to `redirectUrl`. The storefront's `/cart` page redeems the token itself and populates the shopper's cart. You never need to call the redemption query yourself.

## Authentication

Send your API key on every request in the `X-Api-Key` header:

```
X-Api-Key: <your-api-key>
```

The key is shown to you **once**, at creation time, by whoever administers your integration on the Unique Flooring side — there is no way to retrieve it again afterwards, only reissue a new one. If the header is missing, empty, or doesn't match an active integrator, `createGuestCartHandoff` fails with `AUTH_NOT_AUTHORIZED` (see [Errors](/errors)). This is a separate auth mechanism from the Shopper/Admin JWTs described in [Authentication](/auth) — an API key only grants access to `createGuestCartHandoff`, nothing else.

## `createGuestCartHandoff` mutation

```graphql
mutation CreateGuestCartHandoff($items: [GuestCartHandoffItemInput!]!) {
  createGuestCartHandoff(items: $items) {
    redirectUrl
  }
}
```

Send it as an HTTP POST to the same GraphQL endpoint used for catalog queries, with the `X-Api-Key` header attached:

```bash
curl -X POST https://services.uniqueflooring.co.za/graphql \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: <your-api-key>" \
  -d '{
    "query": "mutation CreateGuestCartHandoff($items: [GuestCartHandoffItemInput!]!) { createGuestCartHandoff(items: $items) { redirectUrl } }",
    "variables": { "items": [ { "productId": "3fa85f64-5717-4562-b3fc-2c963f66afa6", "productType": "Decking", "quantity": 2 } ] }
  }'
```

### `GuestCartHandoffItemInput` fields

One entry per line item you want pre-added to the shopper's cart:

| Field | Type | Required | Description |
|---|---|---|---|
| `productId` | `UUID` | Yes | The product's ID. Must reference an existing, enabled product, or the whole mutation fails. |
| `productType` | `String` | Yes | `"Flooring"`, `"WallCladding"`, or `"Decking"`. |
| `quantity` | `Int` | Yes | Quantity of the product. Must be greater than zero. |
| `specConfig` | `SpecCalculationInput` | Only for spec-driven products | Dimension/edge configuration (`length`, `width`, `height`, `edgeRequests`), same shape as `calculateProductSpec`'s `input` argument — see [Product Spec](/querying/product-spec). Omit for products you're adding without a spec configuration. |
| `bomLineItems` | `[CostLineItemInput!]` | No | Your own computed BOM for this item. **Cross-check only** — never persisted or trusted directly. The server always recomputes the BOM itself from `specConfig`. |
| `totalCost` | `Decimal` | No | Your own computed total for this item. If supplied, the server compares it against its own recomputed total and **rejects the whole mutation** if they differ by more than one cent. Omit if you don't want this cross-check. |

`CostLineItemInput` (only meaningful alongside `bomLineItems`, for the cross-check):

| Field | Type |
|---|---|
| `componentName` | `String` |
| `quantity` | `Decimal` |
| `unit` | `String` |
| `unitPrice` | `Decimal` |
| `subtotal` | `Decimal` |

**The server never trusts anything you compute.** For every item with a `specConfig`, it recomputes the BOM itself via the same calculator used by `calculateProductSpec`, and it always uses its own current product price, not anything you send. `bomLineItems` and `totalCost` exist purely so you can catch a mismatch between your own pricing/BOM logic and the server's before the shopper ever sees the cart — send them if you want that safety net, or omit them if you're fine trusting the server's numbers outright.

### Response

```json
{
  "data": {
    "createGuestCartHandoff": {
      "redirectUrl": "https://uniqueflooring.co.za/cart?guestCart=b3c1e6b0-9e2a-4b7a-8f3a-2b6a1f2c9e4d"
    }
  }
}
```

`redirectUrl` is always `<storefront base URL>/cart?guestCart=<token>`, where `<token>` is a single-use handoff ID. Send the shopper's browser there (a redirect, a link, whatever fits your flow) — don't call any further API yourself. The storefront's `/cart` page redeems the token server-side and populates the shopper's guest cart from it.

## Errors

`createGuestCartHandoff` fails the whole mutation (no partial handoff is created) if any item is invalid:

| Condition | Result |
|---|---|
| Missing/invalid `X-Api-Key` | `AUTH_NOT_AUTHORIZED` |
| Empty `items` list | Error: at least one item is required |
| `quantity <= 0` on any item | Error naming the offending item index |
| Unknown `productType` | Error naming the offending item index |
| `productId` doesn't exist, or the product is disabled | Error naming the offending item index |
| `totalCost` supplied and it differs from the server's recomputed total by more than one cent | Error naming the offending item index and both totals |

See [Errors](/errors) for the general GraphQL error response shape.

## TTL and single-use redemption

- A handoff expires **15 minutes** after creation. If the shopper doesn't reach `/cart` with the token in time, the storefront's redemption fails and the shopper sees an empty/expired cart — create a fresh handoff rather than reusing an old `redirectUrl`.
- A handoff can be redeemed **exactly once**. The storefront's `/cart` page redemption happens automatically on load; if the same `redirectUrl` is opened a second time (e.g. the shopper bookmarks it, or your own page is reloaded and re-triggers the redirect), redemption fails because the token was already consumed on the first visit. Generate a new handoff per shopper session/attempt rather than caching and reusing a `redirectUrl`.

## What you don't need to call

Redemption (`redeemGuestCartHandoff`) is called by the storefront's own `/cart` page, not by your integration. You only ever call `createGuestCartHandoff` and redirect the shopper to the URL it returns.
