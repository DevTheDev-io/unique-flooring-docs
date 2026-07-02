---
id: wall-cladding
title: Wall Cladding
sidebar_position: 2
---

# Wall Cladding

Query wall cladding products and their category types.

## Recommended integration query

The query below is the recommended starting point for external integrations. It returns all enabled wall cladding with the primary image and full installation spec in a single request.

```graphql
query GetWallCladding {
  wallCladding(where: { enabled: { eq: true } }) {
    colour
    description
    dimensions
    id
    name
    price
    squaresPerPanel
    wallCladdingType {
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

## Get all enabled wall cladding

```graphql
query GetWallCladding {
  wallCladding(where: { enabled: { eq: true } }) {
    id
    name
    description
    price
    dimensions
    colour
    squaresPerPanel
    wallCladdingType {
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

## Filter by colour

```graphql
query GetWallCladdingByColour {
  wallCladding(where: {
    and: [
      { enabled: { eq: true } }
      { colour: { contains: "white" } }
    ]
  }) {
    id
    name
    price
    colour
    dimensions
  }
}
```

## Filter by type

```graphql
query GetWallCladdingByType {
  wallCladding(where: {
    and: [
      { enabled: { eq: true } }
      { wallCladdingType: { name: { eq: "PVC" } } }
    ]
  }) {
    id
    name
    price
    dimensions
    squaresPerPanel
  }
}
```

## Get wall cladding types

```graphql
query GetWallCladdingTypes {
  wallCladdingTypes {
    name
  }
}
```

## Get wall cladding with installation spec

```graphql
query GetWallCladdingWithSpec {
  wallCladding(where: { enabled: { eq: true } }) {
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
| `dimensions` | `String` | Panel dimensions |
| `colour` | `String` | Colour description |
| `squaresPerPanel` | `Decimal` | Coverage area per panel |
| `enabled` | `Boolean` | Whether the product is active |
| `isFeatured` | `Boolean` | Whether the product is featured |
| `wallCladdingType` | `WallCladdingType` | Category type |
| `productImages` | `[ProductImage]` | Associated images |
| `spec` | `ProductSpec` | Installation components and wastage rules |
