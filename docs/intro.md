---
id: intro
title: Overview
sidebar_position: 1
slug: /
---

# Unique Flooring API

The Unique Flooring API is a GraphQL API that exposes the product catalog — flooring, wall cladding, and decking — along with brands, ranges, and organisation information.

## Endpoint

```
https://services.uniqueflooring.co.za/graphql
```

All requests are standard HTTP POST to this endpoint with a JSON body containing your GraphQL operation.

## What's available

| Resource | Public | Description |
|----------|--------|-------------|
| `flooring` | Yes | Flooring products with type, pricing, stock, and images |
| `wallCladding` | Yes | Wall cladding products with dimensions, stock, and images |
| `decking` | Yes | Decking products with material, profile, stock, and images |
| `flooringTypes` | Yes | Flooring category types |
| `wallCladdingTypes` | Yes | Wall cladding category types |
| `deckingTypes` | Yes | Decking category types |
| `brands` | Yes | Brands with logos |
| `ranges` | Yes | Product ranges belonging to brands |
| `specials` | Yes | Current specials and promotions |
| `organisation` | Yes | Company contact details and addresses |

No authentication is required for any of the above. Customer accounts, cart, and order management are not available for external integration.

## Stock fields

All three product types (`flooring`, `wallCladding`, `decking`) expose four stock fields:

| Field | Type | Description |
|-------|------|-------------|
| `stockQuantity` | `Int` (nullable) | Boxes currently in stock. `null` means stock is not yet tracked for this product. `0` means tracked but currently empty. |
| `leadTimeDays` | `Int` (nullable) | Days to restock from supplier when quantity is insufficient. |
| `minReorderQuantity` | `Int` (nullable) | Minimum boxes per supplier order. |
| `maxReorderQuantity` | `Int` (nullable) | Maximum boxes available to order from supplier at once. |

Stock is managed manually by Unique Flooring staff. Always check `stockQuantity` for `null` before treating it as a count — a `null` value means the product exists but its stock has not been entered yet.

## Technology

The API is built with [Hot Chocolate v16](https://chillicream.com/docs/hotchocolate/v16) on .NET. This means:

- Filtering uses Hot Chocolate's operator syntax: `{ field: { eq: value } }` — see [Filtering](./filtering)
- All list queries support dynamic filtering via `where` argument
- Responses follow the [GraphQL spec](https://spec.graphql.org/) — data under `data`, errors under `errors`
