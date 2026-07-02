---
id: decking
title: Decking
sidebar_position: 3
---

# Decking

Query decking products and their category types.

## Recommended integration query

The query below is the recommended starting point for external integrations. It returns all enabled decking with the primary image and full installation spec in a single request.

```graphql
query GetDecking {
  decking(where: { enabled: { eq: true } }) {
    boardSize
    colour
    description
    finish
    id
    isReversible
    material
    name
    price
    profile
    squaresPerBoard
    warranty
    stockQuantity
    leadTimeDays
    minReorderQuantity
    maxReorderQuantity
    deckingType {
      name
    }
    productImages(where: { isPrimary: { eq: true } }) {
      image {
        url
      }
    }
    spec {
      components {
        componentName
        pricePerUnit
        quantityPerSquareMeter
        unit
      }
      wastageRules {
        maxSquares
        minSquares
        wastagePercentage
      }
    }
  }
}
```

`productImages` is filtered to the primary image only. See [Filtering nested collections](#filtering-nested-collections) below for other options.

## Get all enabled decking

```graphql
query GetDecking {
  decking(where: { enabled: { eq: true } }) {
    id
    name
    description
    price
    boardSize
    material
    profile
    finish
    isReversible
    colour
    warranty
    squaresPerBoard
    stockQuantity
    leadTimeDays
    minReorderQuantity
    maxReorderQuantity
    deckingType {
      name
    }
    productImages {
      image {
        url
      }
    }
  }
}
```

## Get stock availability

```graphql
query GetDeckingStock {
  decking(where: { enabled: { eq: true } }) {
    id
    name
    stockQuantity
    leadTimeDays
    minReorderQuantity
    maxReorderQuantity
  }
}
```

`stockQuantity` is `null` when stock has not been entered for a product. `0` means tracked but currently empty. See [Stock fields](../#stock-fields) for the full semantics.

## Filter by material

```graphql
query GetDeckingByMaterial {
  decking(where: {
    and: [
      { enabled: { eq: true } }
      { material: { contains: "composite" } }
    ]
  }) {
    id
    name
    price
    material
    boardSize
  }
}
```

## Filter by type

```graphql
query GetDeckingByType {
  decking(where: {
    and: [
      { enabled: { eq: true } }
      { deckingType: { name: { eq: "Composite" } } }
    ]
  }) {
    id
    name
    price
    boardSize
    colour
  }
}
```

## Get decking types

```graphql
query GetDeckingTypes {
  deckingTypes {
    name
  }
}
```

## Get decking with installation spec

```graphql
query GetDeckingWithSpec {
  decking(where: { enabled: { eq: true } }) {
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

See [Product Spec](./product-spec) for how to use this data to calculate material quantities.

## Filtering nested collections

`productImages` accepts a `where` argument. Use it to fetch only the primary image instead of all images:

```graphql
productImages(where: { isPrimary: { eq: true } }) {
  image {
    url
  }
}
```

Omit the `where` to return all images for the product.

## Fields reference

| Field | Type | Description |
|-------|------|-------------|
| `id` | `UUID` | Unique identifier |
| `name` | `String` | Product name |
| `description` | `String` | Product description |
| `price` | `Decimal` | Price per unit |
| `boardSize` | `String` | Board dimensions |
| `material` | `String` | Material composition |
| `profile` | `String` | Board profile shape |
| `finish` | `String` | Surface finish |
| `isReversible` | `Boolean` | Whether the board is reversible |
| `colour` | `String` | Colour description |
| `warranty` | `String` | Warranty terms |
| `squaresPerBoard` | `Decimal` | Coverage area per board |
| `enabled` | `Boolean` | Whether the product is active |
| `isFeatured` | `Boolean` | Whether the product is featured |
| `deckingType` | `DeckingType` | Category type |
| `productImages` | `[ProductImage]` | Associated images |
| `spec` | `ProductSpec` | Installation components and wastage rules |
| `stockQuantity` | `Int` (nullable) | Boxes in stock. `null` = not tracked, `0` = tracked/empty |
| `leadTimeDays` | `Int` (nullable) | Days to restock from supplier |
| `minReorderQuantity` | `Int` (nullable) | Minimum boxes per supplier order |
| `maxReorderQuantity` | `Int` (nullable) | Maximum boxes available from supplier |
