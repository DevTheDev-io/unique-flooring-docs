---
id: filtering
title: Filtering
sidebar_position: 4
---

# Filtering

The API uses [Hot Chocolate's filtering system](https://chillicream.com/docs/hotchocolate/v16/fetching-data/filtering). All list queries accept a `where` argument for dynamic filtering.

:::important
Hot Chocolate wraps scalar comparisons in an operator object. The syntax is `{ field: { eq: value } }` — **not** `{ field: value }`.
:::

For the full list of available operators, see the [Hot Chocolate v16 filtering reference](https://chillicream.com/docs/hotchocolate/v16/fetching-data/filtering).

## Common operators

| Operator | Description | Example |
|----------|-------------|---------|
| `eq` | Equals | `{ enabled: { eq: true } }` |
| `neq` | Not equals | `{ enabled: { neq: false } }` |
| `contains` | String contains (case-insensitive) | `{ colour: { contains: "white" } }` |
| `startsWith` | String starts with | `{ name: { startsWith: "Oak" } }` |
| `endsWith` | String ends with | `{ name: { endsWith: "Natural" } }` |
| `gt` | Greater than | `{ price: { gt: 100 } }` |
| `gte` | Greater than or equal | `{ price: { gte: 100 } }` |
| `lt` | Less than | `{ price: { lt: 500 } }` |
| `lte` | Less than or equal | `{ price: { lte: 500 } }` |
| `in` | Value is in list | `{ name: { in: ["Oak", "Pine"] } }` |
| `nIn` | Value is not in list | `{ name: { nIn: ["Teak"] } }` |

## Combining conditions

Use `and` / `or` arrays to combine multiple filters:

```graphql
# AND — all conditions must match
flooring(where: {
  and: [
    { enabled: { eq: true } }
    { price: { lte: 300 } }
    { flooringType: { name: { eq: "Laminate" } } }
  ]
})

# OR — any condition may match
flooring(where: {
  or: [
    { flooringType: { name: { eq: "Laminate" } } }
    { flooringType: { name: { eq: "Vinyl" } } }
  ]
})
```

## Filtering on nested types

You can filter on related type names directly:

```graphql
flooring(where: { flooringType: { name: { eq: "Engineered Wood" } } }) {
  id
  name
}
```
