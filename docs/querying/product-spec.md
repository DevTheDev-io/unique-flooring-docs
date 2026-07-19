---
id: product-spec
title: Product Spec
sidebar_position: 4
---

# Product Spec

:::warning[Under Construction]

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
        parameters {
          key
          value
        }
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

### Inputs for wastage and quantity

| Value                    | Where it comes from                                        |
| ------------------------ | ---------------------------------------------------------- |
| `area`                   | You supply this (the room/deck area you're quoting, in m²) |
| `wastageRules`           | From `spec.wastageRules`                                   |
| `quantityPerSquareMeter` | From each component in `spec.components`                   |

### 1. Determine the applicable wastage percentage

Find the wastage rule where `minSquares <= area` and either `maxSquares` is `null` (unbounded) or `maxSquares > area`. Rules are returned sorted by `minSquares` ascending.

```text
effectiveArea = area × (1 + wastagePercentage / 100)
```

### 2. Calculate quantity per component

For each component in `spec.components`:

```text
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

| `calculationType`  | Scales with              | You must supply             |
| ------------------ | ------------------------ | --------------------------- |
| `PER_SQUARE_METER` | Area                     | `area`                      |
| `PER_EDGE_LENGTH`  | Edge run length          | `runLength`, `height`       |
| `GRID_SPACING`     | Footprint length × width | `length`, `width`, `height` |

### `PER_SQUARE_METER`

The formula from the section above: `quantity = effectiveArea × quantityPerSquareMeter`.

### `PER_EDGE_LENGTH`

For components that only apply to specific edges, coursed vertically by height (e.g. fascia boards), not proportional to area. `isOptional: true` components of this type must be explicitly requested: pass the run length of only the edges that need them (e.g. summed edges where fascia is needed, not the full room perimeter).

#### Inputs for PER_EDGE_LENGTH

| Value               | Where it comes from                                                              |
| ------------------- | -------------------------------------------------------------------------------- |
| `courseHeight`      | From `spec.components[].parameters`                                              |
| `unitSize`          | From the component itself, e.g. `2.85` for a 2.85m board (not from `parameters`) |
| `pricePerUnit`      | From the component itself                                                        |
| `wastagePercentage` | From the matched `spec.wastageRules` entry (0 if none matched)                   |
| `height`            | You supply (structure height)                                                    |
| `runLength`         | You supply (total edge length needing this component)                            |

#### Steps for PER_EDGE_LENGTH

1. Work out how many horizontal courses stack up to the full height: `courses = ceil(height / courseHeight)`
2. Multiply by run length to get the raw board length needed: `rawLength = runLength × courses`
3. Add wastage: `wastedLength = rawLength × (1 + (wastagePercentage ?? 0))`
4. Convert to whole units: `quantity = ceil(wastedLength / unitSize)`

```text
courses = ceil(height / courseHeight)
rawLength = runLength × courses
wastedLength = rawLength × (1 + (wastagePercentage ?? 0))
quantity = ceil(wastedLength / unitSize)
```

:::danger Ceiling rule
Apply `ceil()` **once**, on the _aggregate_ run length across the whole edge (or whole room) you're calculating for. If you calculate a sub-region (e.g. a single 1m-wide section of a wall) and `ceil()` that independently, then sum multiple sub-regions, you will overcount. Use the continuous cost-share formula below for sub-region breakdowns instead.
:::

**Worked example:** 4m × 4m deck, height 200mm, fascia needed on two edges totalling 6m, board = 2.85m long / R368, courses every 146mm:

```text
courses = ceil(0.2 / 0.146) = 2
rawLength = 6 × 2 = 12
quantity = ceil(12 / 2.85) = 5 boards
totalCost = 5 × 368 = R1,840
```

**Sub-region cost share.** Use this only to show the cost of a smaller slice of the edge (e.g. one 1m section) for display purposes. It is informational only: it does not round, and the result is not a separately-purchasable quantity.

```text
costShare = (pricePerUnit / unitSize) × segmentRunLength × courses × (1 + (wastagePercentage ?? 0))
```

For the same example, a 1m segment: `(368 / 2.85) × 1 × 2 = R258.25`. Summed segment cost-shares will not exactly equal the discrete `totalCost` above; the discrete total is what's actually purchased.

### `GRID_SPACING`

For components laid out on a real 2D grid under the product (e.g. support posts/tubing under a raised deck) rather than a flat area- or edge-based estimate. Not proportional to area or edge length: it scales with the footprint's length and width independently, and is gated by height, since a flush/surface-mounted product needs no posts at all.

#### Inputs for GRID_SPACING

| Value             | Where it comes from                                                         |
| ----------------- | --------------------------------------------------------------------------- |
| `postSpacing`     | From `spec.components[].parameters` (metres between posts, along both axes) |
| `length`, `width` | You supply (footprint dimensions)                                           |
| `height`          | You supply (structure height)                                               |

#### Steps for GRID_SPACING

1. If the structure sits flush on the ground, no posts are needed: `if height <= 0: quantity = 0`
2. Otherwise, count posts along each axis, adding 1 for the starting post: `postsAlongLength = ceil(length / postSpacing) + 1` and `postsAlongWidth = ceil(width / postSpacing) + 1`
3. Multiply the two axis counts: `quantity = postsAlongLength × postsAlongWidth`

```text
if height <= 0: quantity = 0   // surface-mounted, no posts needed
postsAlongLength = ceil(length / postSpacing) + 1
postsAlongWidth  = ceil(width / postSpacing) + 1
quantity = postsAlongLength × postsAlongWidth
```

**Worked example:** 4.2m × 2.8m deck, raised (height > 0), posts every 1.4m:

```text
postsAlongLength = ceil(4.2 / 1.4) + 1 = 3 + 1 = 4
postsAlongWidth  = ceil(2.8 / 1.4) + 1 = 2 + 1 = 3
quantity = 4 × 3 = 12 posts
```

:::tip
At height 0 (surface-mounted), `quantity = 0`. Omit this component from your BOM entirely rather than showing a zero-quantity line. `GRID_SPACING` components are never `isOptional`: height alone determines whether posts are needed, so there's nothing for you to opt into.
:::

## Height-dependent length

Independent of `calculationType`. When `heightDependentLength: true`, the component's _count_ still comes from its normal `calculationType` formula above, but its final quantity is scaled by a per-unit length that itself depends on height (e.g. a support post embedded in the ground: the deeper the deck sits, the longer the post must be).

### Inputs for height-dependent length

| Value        | Where it comes from                                                                                                                                                                                           |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `count`      | Result of the component's own `calculationType` formula above                                                                                                                                                 |
| `embedRatio` | From `spec.components[].parameters` (fraction of height added on top, e.g. `0.3` for 30%; not a fixed metres constant, since a taller structure needs proportionally more embedded length, not a flat offset) |
| `height`     | You supply (structure height)                                                                                                                                                                                 |

### Steps for height-dependent length

1. Work out how deep the unit is embedded: `embedDepth = height × embedRatio`
2. Add that to the exposed height to get the full unit length: `unitLength = height + embedDepth`
3. Multiply by the count from step 1's formula: `quantity = count × unitLength`

```text
embedDepth = height × embedRatio
unitLength = height + embedDepth
quantity = count × unitLength
```

**Example:** square tubing at `quantityPerSquareMeter = 0.51` (density-based post count, i.e. `PER_SQUARE_METER`), `embedRatio = 0.3`, for a 16m² deck at 200mm height:

```text
count = 16 × 0.51 = 8.16
embedDepth = 0.2 × 0.3 = 0.06
unitLength = 0.2 + 0.06 = 0.26
quantity = 8.16 × 0.26 = 2.1216m of tubing
```

:::note
Post count from `quantityPerSquareMeter` (i.e. `PER_SQUARE_METER` combined with `heightDependentLength`) is a density estimate, not an exact grid layout. Treat it as an approximation for costing/ordering purposes. If the product needs an exact grid layout instead, look for a `GRID_SPACING` component (see above) rather than a density-based one.
:::

## Requesting optional components

Components with `isOptional: true` are excluded from your BOM unless you explicitly include them. You're responsible for supplying whatever extra measurement their `calculationType` needs (a run length for `PER_EDGE_LENGTH`). There's no server-side "please include this" flag to send; simply run that component's formula yourself with your own measurements and add it to your total.

## `ProductSpec` fields

| Field          | Type                  | Description                                                 |
| -------------- | --------------------- | ----------------------------------------------------------- |
| `components`   | `[SpecItem!]!`        | Installation components for this product type               |
| `wastageRules` | `[SpecWastageRule!]!` | Tiered wastage percentages sorted by `minSquares` ascending |

## `SpecItem` fields

| Field                    | Type                       | Description                                                                                                               |
| ------------------------ | -------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `componentId`            | `Int`                      | ID of the underlying reusable Component; use this to key any per-component requests you send back (e.g. edge run lengths) |
| `componentName`          | `String`                   | Human-readable component name                                                                                             |
| `unitLabel`              | `String`                   | Display label for the unit (e.g. `2.85m board`); do not parse this                                                        |
| `unitSize`               | `Decimal` \| `null`        | Canonical physical size of one unit, metres (used by `PER_EDGE_LENGTH`)                                                   |
| `pricePerUnit`           | `Decimal`                  | Current price per unit                                                                                                    |
| `calculationType`        | `ComponentCalculationType` | `PER_SQUARE_METER`, `PER_EDGE_LENGTH`, or `GRID_SPACING` (see Calculation types above)                                    |
| `quantityPerSquareMeter` | `Decimal` \| `null`        | Units required per m² (only set when `calculationType` is `PER_SQUARE_METER`)                                             |
| `isOptional`             | `Boolean`                  | If true, only include this component if you supply its extra measurement                                                  |
| `heightDependentLength`  | `Boolean`                  | If true, see Height-dependent length above                                                                                |
| `parameters`             | `[CalcParameter!]!`        | Calc-type-specific values, e.g. `courseHeight`, `embedRatio`, `postSpacing`, `wastagePercentage`                          |

## `CalcParameter` fields

| Field   | Type      | Description                         |
| ------- | --------- | ----------------------------------- |
| `key`   | `String`  | Parameter name, e.g. `courseHeight` |
| `value` | `Decimal` | Parameter value                     |

## `SpecWastageRule` fields

| Field               | Type                | Description                                                        |
| ------------------- | ------------------- | ------------------------------------------------------------------ |
| `minSquares`        | `Decimal`           | Lower bound of the area range (inclusive)                          |
| `maxSquares`        | `Decimal` \| `null` | Upper bound of the area range (exclusive). `null` means unbounded. |
| `wastagePercentage` | `Decimal`           | Percentage to add to the raw area before calculating quantities    |
