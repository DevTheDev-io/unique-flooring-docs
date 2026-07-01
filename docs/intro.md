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
| `flooring` | Yes | Flooring products with type, pricing, and images |
| `wallCladding` | Yes | Wall cladding products with dimensions and images |
| `decking` | Yes | Decking products with material, profile, and images |
| `flooringTypes` | Yes | Flooring category types |
| `wallCladdingTypes` | Yes | Wall cladding category types |
| `deckingTypes` | Yes | Decking category types |
| `brands` | Yes | Brands with logos |
| `ranges` | Yes | Product ranges belonging to brands |
| `specials` | Yes | Current specials and promotions |
| `organisation` | Yes | Company contact details and addresses |

No authentication is required for any of the above. Customer accounts, cart, and order management are not available for external integration.

## Technology

The API is built with [Hot Chocolate v16](https://chillicream.com/docs/hotchocolate/v16) on .NET. This means:

- Filtering uses Hot Chocolate's operator syntax: `{ field: { eq: value } }` — see [Filtering](./filtering)
- All list queries support dynamic filtering via `where` argument
- Responses follow the [GraphQL spec](https://spec.graphql.org/) — data under `data`, errors under `errors`
