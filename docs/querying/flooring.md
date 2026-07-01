---
id: flooring
title: Flooring
sidebar_position: 1
---

# Flooring

Query flooring products and their category types.

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
