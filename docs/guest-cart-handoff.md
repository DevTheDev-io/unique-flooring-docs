---
id: guest-cart-handoff
title: Guest Cart Handoff
sidebar_position: 4
---

# Guest Cart Handoff

Lets an external integrator build a cart on the shopper's behalf (e.g. a configurator, marketplace, or quoting tool on a partner site) and hand it off to the Unique Flooring storefront with the items pre-populated, without the shopper needing an account.

The flow has three steps:

1. Get an API key issued to your integration (see [Getting an API key](#getting-an-api-key) below) — a one-time setup step, not something you call per request.
2. Your backend calls `createGuestCartHandoff` with the items to add, authenticated with that API key. You get back a `redirectUrl`.
3. You redirect the shopper's browser to `redirectUrl`. The storefront's `/cart` page redeems the token itself and populates the shopper's cart. You never need to call the redemption query yourself.

## Getting an API key

API keys are issued and revoked by a Unique Flooring admin from the admin dashboard (Admin → External Integrators), not through any call you make yourself. To get set up:

1. Contact whoever administers the Unique Flooring instance you're integrating with and give them a name for your integration (e.g. `"Acme Configurator"`) — this is just a label shown in their admin dashboard to identify which key belongs to which integration, it has no bearing on what the key can do.
2. They create the integrator from Admin → External Integrators, which generates the key.
3. **The raw key is shown to them once, at creation time, and never again afterwards.** They need to pass it to you out-of-band (however you two exchange secrets) immediately — there is no "view key" screen to come back to later. If it's lost, the only recovery is revoking that integrator and issuing a new one, which means updating the key on your end too.

Every issued key maps to exactly one integrator record and has no expiry by itself, but an admin can revoke it at any time from the same dashboard page. A revoked key stops authenticating immediately: every subsequent `createGuestCartHandoff` call fails with `AUTH_NOT_AUTHENTICATED` until you're issued a new one. If your integration suddenly starts failing every request with that error and nothing changed on your end, ask the admin whether your key was revoked or rotated.

There is no self-service way to list, rotate, or check the status of your own key — that's entirely admin-side. If you need to confirm your key is still active, the only way is to make a real `createGuestCartHandoff` call and check whether it succeeds.

## Authentication

Send your API key on every request in the `X-Api-Key` header:

```
X-Api-Key: <your-api-key>
```

If the header is missing, empty, or doesn't match an active integrator, `createGuestCartHandoff` fails with `AUTH_NOT_AUTHENTICATED` (see [Errors](/errors)). This is a separate auth mechanism from the Shopper/Admin JWTs described in [Authentication](/auth) — an API key only grants access to `createGuestCartHandoff`, nothing else. It cannot read or mutate anything else in the API: no catalog, cart, order, or customer data beyond what this one mutation returns.

## Endpoint

Every call in this guide goes to the same GraphQL endpoint used for everything else in this API:

```
POST https://services.uniqueflooring.co.za/graphql
Content-Type: application/json
X-Api-Key: <your-api-key>
```

There's no separate REST endpoint or base path for this flow — it's a single GraphQL mutation (`createGuestCartHandoff`) sent to the standard endpoint, with the `X-Api-Key` header attached. See [Integration Guide](/integration-guide) for client code examples per stack (.NET, Node, React) — the same setup works here, just add the `X-Api-Key` header and point at this mutation instead of a catalog query.

## `createGuestCartHandoff` mutation

```graphql
mutation CreateGuestCartHandoff($items: [GuestCartHandoffItemInput!]!) {
  createGuestCartHandoff(items: $items) {
    redirectUrl
  }
}
```

Example request:

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
| `totalCost` | `Decimal` | No | Your own computed total for this item. If supplied, the server compares it against its own recomputed total and **rejects the whole mutation** if they differ by more than one cent. Omit if you don't want this cross-check. |

**The server never trusts anything you compute.** For every item with a `specConfig`, it recomputes the BOM itself via the same calculator used by `calculateProductSpec`, and it always uses its own current product price, not anything you send. There is no field for submitting your own BOM line items — only the aggregate `totalCost` is accepted, and only as an optional cross-check against the server's own recomputed total. Send it if you want that safety net, or omit it if you're fine trusting the server's numbers outright.

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
| Missing/invalid `X-Api-Key` | `AUTH_NOT_AUTHENTICATED` |
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
