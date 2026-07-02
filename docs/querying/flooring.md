---
id: flooring
title: Flooring
sidebar_position: 1
---

# Flooring

Query flooring products and their category types.

## Recommended integration query

The query below is the recommended starting point for external integrations. It returns all enabled flooring with the primary image and full installation spec in a single request.

```graphql
query GetFlooring {
  flooring(where: { enabled: { eq: true } }) {
    description
    grading
    id
    name
    plankSize
    price
    squares
    warranty
    flooringType {
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

## Get all enabled flooring

```graphql
query GetFlooring {
  flooring(where: { enabled: { eq: true } }) {
    description
    grading
    id
    name
    plankSize
    price
    squares
    warranty
    flooringType {
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

## Filter by flooring type

```graphql
query GetFlooringByType {
  flooring(where: {
    and: [
      { enabled: { eq: true } }
      { flooringType: { name: { eq: "Engineered Wood" } } }
    ]
  }) {
    id
    name
    price
    plankSize
    grading
  }
}
```

## Filter by price range

```graphql
query GetFlooringByPrice {
  flooring(where: {
    and: [
      { enabled: { eq: true } }
      { price: { gte: 100 } }
      { price: { lte: 500 } }
    ]
  }) {
    id
    name
    price
    plankSize
  }
}
```

## Get flooring types

```graphql
query GetFlooringTypes {
  flooringTypes {
    name
  }
}
```

## Get flooring with installation spec

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
| `plankSize` | `String` | Plank dimensions |
| `grading` | `String` | Quality grading |
| `squares` | `Decimal` | Coverage area per pack |
| `warranty` | `String` | Warranty terms |
| `enabled` | `Boolean` | Whether the product is active |
| `isFeatured` | `Boolean` | Whether the product is featured |
| `flooringType` | `FlooringType` | Category type |
| `productImages` | `[ProductImage]` | Associated images |
| `spec` | `ProductSpec` | Installation components and wastage rules |
