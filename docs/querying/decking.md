---
id: decking
title: Decking
sidebar_position: 3
---

# Decking

Query decking products and their category types.

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
