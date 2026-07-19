---
id: getting-started
title: Getting Started
sidebar_position: 2
---

# Getting Started

This guide takes you from nothing to running your first query against the Unique Flooring API.

## Option A: Explore with Nitro (recommended)

[Nitro](https://nitro.chillicream.com) is an interactive GraphQL IDE that loads the full schema so you can explore, autocomplete, and run queries in your browser.

### Steps

1. **Accept the org invite.** You will receive an email invitation to join the Unique Flooring organisation on Nitro. Accept it and create a free Nitro account if you don't have one.

2. **Open Nitro.** Go to [nitro.chillicream.com](https://nitro.chillicream.com) and sign in.

3. **Create a new document.** Click the `+` button in the Documents panel on the left.

4. **Configure the connection.** Click **Connection Settings** and fill in:

   | Field | Value |
   |-------|-------|
   | HTTP Endpoint | `https://services.uniqueflooring.co.za/graphql` |
   | SDL Schema Endpoint | `https://services.uniqueflooring.co.za/graphql?sdl` |

5. **Click Apply.** The schema loads. You now have full autocomplete in the query editor.

6. **Run your first query**:

```graphql
query GetFlooring {
  flooring(where: { enabled: { eq: true } }) {
    id
    name
    price
    stockQuantity
    leadTimeDays
    minReorderQuantity
    maxReorderQuantity
    flooringType {
      name
    }
  }
}
```

---

## Option B: Use your own GraphQL client

If you prefer to work locally or integrate directly into your tooling:

### Download the schema

```bash
curl https://services.uniqueflooring.co.za/graphql?sdl -o schema.graphql
```

### VS Code

Install the [GraphQL: Language Feature Support](https://marketplace.visualstudio.com/items?itemName=GraphQL.vscode-graphql) extension and add a `graphql.config.yml` in your project:

```yaml
schema: schema.graphql
documents: '**/*.graphql'
```

### Insomnia / Postman

Both support GraphQL natively. Create a new GraphQL request, point it at `https://services.uniqueflooring.co.za/graphql`, and import `schema.graphql` for schema-aware autocomplete.

### Making requests directly

All GraphQL requests are HTTP POST with a JSON body:

```bash
curl -X POST https://services.uniqueflooring.co.za/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ flooring(where: { enabled: { eq: true } }) { id name price } }"}'
```
