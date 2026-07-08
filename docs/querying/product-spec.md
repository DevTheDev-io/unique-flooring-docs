---
id: product-spec
title: Product Spec
sidebar_position: 4
---

# Product Spec

:::warning

Under Construction
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
        componentId
        componentName
        unitLabel
        unitSize
        pricePerUnit
        calculationType
        quantityPerSquareMeter
        isOptional
        heightDependentLength
        parameters { key value }
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

| Component | Unit  | Qty/m² | Required        |
| --------- | ----- | ------ | --------------- |
| Adhesive  | liter | 0.3    | 8.25 liters     |
| Underlay  | m²    | 1.0    | 27.5 m²         |
| Screws    | pack  | 0.05   | 1.375 → 2 packs |

## Calculation types

Not every component scales with area. `calculationType` on each `SpecItem` tells you which formula to run:

### `PER_SQUARE_METER`

The formula from the section above: `quantity = effectiveArea × quantityPerSquareMeter`.

### `PER_EDGE_LENGTH`

For components that only apply to specific edges, coursed vertically by height (e.g. fascia boards) — not proportional to area. Requires `isOptional: true` components to be explicitly requested, with the run length of only the edges that need them (e.g. summed edges where fascia is needed, not the full room perimeter).

Required `parameters`: `courseHeight` (metres per vertical course).

```
courses = ceil(height / courseHeight)
rawLength = runLength × courses
wastedLength = rawLength × (1 + (wastagePercentage ?? 0))
quantity = ceil(wastedLength / unitSize)
```

**`unitSize`** comes from the component itself (physical size of one unit, e.g. `2.85` for a 2.85m board) — not from `parameters`.

**Ceiling rule — read this before implementing:** the `ceil()` above must be applied once, on the *aggregate* run length across the whole edge (or whole room) you're calculating for. If you calculate a sub-region (e.g. a single 1m-wide section of a wall) and `ceil()` that independently, then sum multiple sub-regions, you will overcount. Use the continuous cost-share formula below for sub-region breakdowns instead.

**Worked example:** 4m × 4m deck, height 200mm, fascia needed on two edges totalling 6m, board = 2.85m long / R368, courses every 146mm:

```
courses = ceil(0.2 / 0.146) = 2
rawLength = 6 × 2 = 12
quantity = ceil(12 / 2.85) = 5 boards
totalCost = 5 × 368 = R1,840
```

**Sub-region cost share** (e.g. showing the cost of just one 1m section of that edge — informational only, does not round, and does not equal a separately-purchasable quantity):

```
costShare = (pricePerUnit / unitSize) × segmentRunLength × courses × (1 + (wastagePercentage ?? 0))
```

For the same example, a 1m segment: `(368 / 2.85) × 1 × 2 = R258.25`. Summed segment cost-shares will not exactly equal the discrete `totalCost` above — the discrete total is what's actually purchased.

### `GRID_SPACING`

For components laid out on a real 2D grid under the product — e.g. support posts/tubing under a raised deck — rather than a flat area- or edge-based estimate. Not proportional to area or edge length; scales with the footprint's length and width independently, and is gated by height: a flush/surface-mounted product needs no posts at all.

Required `parameters`: `postSpacing` (metres between posts, along both axes).

```
if height <= 0: quantity = 0   // surface-mounted — no posts needed
postsAlongLength = ceil(length / postSpacing) + 1
postsAlongWidth  = ceil(width / postSpacing) + 1
quantity = postsAlongLength × postsAlongWidth
```

**Worked example:** 4.2m × 2.8m deck, raised (height > 0), posts every 1.4m:

```
postsAlongLength = ceil(4.2 / 1.4) + 1 = 3 + 1 = 4
postsAlongWidth  = ceil(2.8 / 1.4) + 1 = 2 + 1 = 3
quantity = 4 × 3 = 12 posts
```

At height 0 (surface-mounted), `quantity = 0` — omit this component from your BOM entirely rather than showing a zero-quantity line.

`GRID_SPACING` components are never `isOptional` — height alone determines whether posts are needed, so there's nothing for you to opt into.

## Height-dependent length

Independent of `calculationType` — when `heightDependentLength: true`, the component's *count* comes from its normal `calculationType` formula, but its final quantity is scaled by a per-unit length that itself depends on height (e.g. a support post embedded in the ground: the deeper the deck sits, the longer the post must be).

Required `parameters`: `embedRatio` (fraction of height added on top, e.g. `0.3` for 30% — not a fixed metres constant, since a taller structure needs proportionally more embedded length, not a flat offset).

```
embedDepth = height × embedRatio
unitLength = height + embedDepth
quantity = count × unitLength
```

**Example:** square tubing at `quantityPerSquareMeter = 0.51` (density-based post count), `embedRatio = 0.3`, for a 16m² deck at 200mm height:

```
count = 16 × 0.51 = 8.16
embedDepth = 0.2 × 0.3 = 0.06
unitLength = 0.2 + 0.06 = 0.26
quantity = 8.16 × 0.26 = 2.1216m of tubing
```

:::note
Post count from `quantityPerSquareMeter` (i.e. `PER_SQUARE_METER` combined with `heightDependentLength`) is a density estimate, not an exact grid layout — treat it as an approximation for costing/ordering purposes. If the product needs an exact grid layout instead, look for a `GRID_SPACING` component (see above) rather than a density-based one.
:::

## Requesting optional components

Components with `isOptional: true` are excluded from your BOM unless you explicitly include them — you're responsible for supplying whatever extra measurement their `calculationType` needs (a run length for `PER_EDGE_LENGTH`). There's no server-side "please include this" flag to send; simply run that component's formula yourself with your own measurements and add it to your total.

## `ProductSpec` fields

| Field          | Type                  | Description                                                 |
| -------------- | --------------------- | ----------------------------------------------------------- |
| `components`   | `[SpecItem!]!`        | Installation components for this product type               |
| `wastageRules` | `[SpecWastageRule!]!` | Tiered wastage percentages sorted by `minSquares` ascending |

## `SpecItem` fields

| Field                    | Type                  | Description                                                          |
| ------------------------ | --------------------- | ---------------------------------------------------------------------|
| `componentId`            | `Int`                  | ID of the underlying reusable Component — use this to key any per-component requests you send back (e.g. edge run lengths) |
| `componentName`          | `String`               | Human-readable component name                                        |
| `unitLabel`              | `String`               | Display label for the unit (e.g. `2.85m board`) — do not parse this  |
| `unitSize`               | `Decimal` \| `null`    | Canonical physical size of one unit, metres (used by `PER_EDGE_LENGTH`) |
| `pricePerUnit`           | `Decimal`              | Current price per unit                                                |
| `calculationType`        | `ComponentCalculationType` | `PER_SQUARE_METER`, `PER_EDGE_LENGTH`, or `GRID_SPACING` — see Calculation types above |
| `quantityPerSquareMeter` | `Decimal` \| `null`    | Units required per m² (only set when `calculationType` is `PER_SQUARE_METER`) |
| `isOptional`             | `Boolean`              | If true, only include this component if you supply its extra measurement |
| `heightDependentLength`  | `Boolean`              | If true, see Height-dependent length above                            |
| `parameters`             | `[CalcParameter!]!`    | Calc-type-specific values, e.g. `courseHeight`, `embedRatio`, `postSpacing`, `wastagePercentage` |

## `CalcParameter` fields

| Field   | Type      | Description                          |
| ------- | --------- | ------------------------------------ |
| `key`   | `String`  | Parameter name, e.g. `courseHeight`  |
| `value` | `Decimal` | Parameter value                      |

## `SpecWastageRule` fields

| Field               | Type                | Description                                                        |
| ------------------- | ------------------- | ------------------------------------------------------------------ |
| `minSquares`        | `Decimal`           | Lower bound of the area range (inclusive)                          |
| `maxSquares`        | `Decimal` \| `null` | Upper bound of the area range (exclusive). `null` means unbounded. |
| `wastagePercentage` | `Decimal`           | Percentage to add to the raw area before calculating quantities    |
