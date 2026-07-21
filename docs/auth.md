---
id: auth
title: Authentication
sidebar_position: 6
---

# Authentication

## Public access

All product catalog queries are publicly accessible, and no authentication token is required. You can query flooring, wall cladding, decking, brands, ranges, specials, and organisation information without any credentials.

## What requires authentication

The following are **not available** for external integration:

| Area | Auth required | Notes |
|------|---------------|-------|
| Customer accounts | Shopper JWT | Register/login via the Unique Flooring website |
| Shopping cart (direct read/write) | Shopper JWT | Per-customer cart management |
| Order history | Shopper JWT | Customer's own orders |
| Admin operations | Admin JWT | Product management, order status updates |

These operations require a JWT token issued by the Unique Flooring authentication service and are not intended for external API consumers.

## API key auth (external integrators)

A separate mechanism from the Shopper/Admin JWTs above: an external integrator can be issued an API key (by a Unique Flooring admin) to call `createGuestCartHandoff`, which hands a pre-built cart off to a shopper without requiring them to have an account. Sent via the `X-Api-Key` header, not a JWT. See [Guest Cart Handoff](/guest-cart-handoff) for the full contract.

## If you receive AUTH_NOT_AUTHORIZED

You are querying a field or mutation that requires authentication. Check the [Overview](/) for the list of publicly available queries and ensure you are only using those.
