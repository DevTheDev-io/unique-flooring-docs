---
id: errors
title: Errors
sidebar_position: 5
---

# Errors

The API follows the [GraphQL specification](https://spec.graphql.org/October2021/#sec-Errors) for error handling. Errors are returned in the `errors` array alongside any partial `data`.

## Error response shape

```json
{
  "errors": [
    {
      "message": "Human-readable error message",
      "locations": [{ "line": 2, "column": 3 }],
      "path": ["flooring", 0, "name"],
      "extensions": {
        "code": "AUTH_NOT_AUTHORIZED"
      }
    }
  ],
  "data": null
}
```

## Common error codes

| Code | Meaning |
|------|---------|
| `AUTH_NOT_AUTHORIZED` | Operation requires authentication |
| `VALIDATION_ERROR` | Query failed schema validation (e.g. unknown field) |

## Partial responses

GraphQL can return partial data alongside errors. If one field fails, others may still resolve successfully:

```json
{
  "data": {
    "flooring": [{ "id": "...", "name": "Oak Plank", "price": null }]
  },
  "errors": [
    { "message": "...", "path": ["flooring", 0, "price"] }
  ]
}
```

Always check the `errors` array even when `data` is present.
