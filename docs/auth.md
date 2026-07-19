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
| Shopping cart | Shopper JWT | Per-customer cart management |
| Order history | Shopper JWT | Customer's own orders |
| Admin operations | Admin JWT | Product management, order status updates |

These operations require a JWT token issued by the Unique Flooring authentication service and are not intended for external API consumers.

## If you receive AUTH_NOT_AUTHORIZED

You are querying a field or mutation that requires authentication. Check the [Overview](/) for the list of publicly available queries and ensure you are only using those.
