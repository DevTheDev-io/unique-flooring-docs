---
id: product-spec
title: Product Spec
sidebar_position: 4
---

# Product Spec

:::caution Under Construction
The product spec system is still under active development. Fields and behavior on this page may change.
:::

Every product (flooring, wall cladding, decking) exposes a `spec` field containing the full installation component list and tiered wastage rules for that product type. Use this to calculate the complete material requirements for a given area.

## Querying the spec

`spec` is a sub-field on any product query. No authentication is required.

```graphql
query GetFlooringWithSpec {
  flooring(where: { enabled: { eq: true } }) {
    id
    name
    price
    spec {
      components {
        componentName
        unit
        pricePerUnit
        quantityPerSquareMeter
      }
      wastageRules {
        minSquares
        maxSquares
        wastagePercentage
      }
    }
  }
}
```

The same pattern applies to `wallCladding` and `decking`.

## Calculating material quantities

Given an area in m² and a product's spec:

### 1. Determine the applicable wastage percentage

Find the wastage rule where `minSquares <= area` and either `maxSquares` is `null` (unbounded) or `maxSquares > area`. Rules are returned sorted by `minSquares` ascending.

```
effectiveArea = area × (1 + wastagePercentage / 100)
```

### 2. Calculate quantity per component

For each component in `spec.components`:

```
quantity = effectiveArea × quantityPerSquareMeter
```

Round up to the nearest whole unit as appropriate for the component's unit type (e.g. packs, boards).

### 3. Example

Area: **25 m²**, wastage rule matched: **10%**, effective area: **27.5 m²**

| Component | Unit | Qty/m² | Required |
|---|---|---|---|
| Adhesive | liter | 0.3 | 8.25 liters |
| Underlay | m² | 1.0 | 27.5 m² |
| Screws | pack | 0.05 | 1.375 → 2 packs |

## `ProductSpec` fields

| Field | Type | Description |
|---|---|---|
| `components` | `[SpecItem!]!` | Installation components for this product type |
| `wastageRules` | `[SpecWastageRule!]!` | Tiered wastage percentages sorted by `minSquares` ascending |

## `SpecItem` fields

| Field | Type | Description |
|---|---|---|
| `componentName` | `String` | Human-readable component name |
| `unit` | `String` | Unit of measure (e.g. `liter`, `m²`, `pack`) |
| `pricePerUnit` | `Decimal` | Current price per unit |
| `quantityPerSquareMeter` | `Decimal` | Units required per m² of effective area |

## `SpecWastageRule` fields

| Field | Type | Description |
|---|---|---|
| `minSquares` | `Decimal` | Lower bound of the area range (inclusive) |
| `maxSquares` | `Decimal` \| `null` | Upper bound of the area range (exclusive). `null` means unbounded. |
| `wastagePercentage` | `Decimal` | Percentage to add to the raw area before calculating quantities |
