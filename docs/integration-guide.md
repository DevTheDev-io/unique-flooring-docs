---
id: integration-guide
title: Integration Guide
sidebar_position: 3
---

# Integration Guide

Concrete client code for calling the Unique Flooring GraphQL API from the stacks external integrators commonly use. Every example below runs the same query, `GetFlooring`, so you can compare how each stack does the same request.

All requests go to `https://services.uniqueflooring.co.za/graphql` as an HTTP POST with a JSON body. Catalog queries (flooring, wall cladding, decking, brands, ranges, specials, organisation) are public and require no auth token. See [Authentication](/auth) for what's off-limits.

The example query used throughout:

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

## .NET service-to-service (StrawberryShake)

If you're calling this API from another Hot Chocolate/.NET service, use [StrawberryShake](https://chillicream.com/docs/strawberryshake), Hot Chocolate's official typed GraphQL client. It generates a strongly-typed C# client from the schema, so queries are checked at compile time.

### Setup

```bash
dotnet tool install StrawberryShake.Tools --global
dotnet add package StrawberryShake.Transport.Http
dotnet graphql init https://services.uniqueflooring.co.za/graphql -n UniqueFlooringClient
```

This creates a `.graphqlrc.json` pointing at the schema and a client project scaffold. Add your `.graphql` query documents (like `GetFlooring.graphql` containing the query above) to that project. StrawberryShake generates the typed client at build time.

### Registering the client (DI)

```csharp
services
    .AddUniqueFlooringClient()
    .ConfigureHttpClient(client =>
        client.BaseAddress = new Uri("https://services.uniqueflooring.co.za/graphql"));
```

### Calling it

```csharp
public class FlooringService
{
    private readonly IUniqueFlooringClient _client;

    public FlooringService(IUniqueFlooringClient client) => _client = client;

    public async Task<List<GetFlooring_Flooring>> GetEnabledFlooringAsync()
    {
        var result = await _client.GetFlooring.ExecuteAsync();

        if (result.IsErrorResult())
        {
            throw new InvalidOperationException(
                string.Join("; ", result.Errors.Select(e => e.Message)));
        }

        return result.Data!.Flooring.ToList();
    }
}
```

---

## React frontend

For a public, read-only API, a lightweight combination of [`graphql-request`](https://github.com/jasonkuhrt/graphql-request) and [`@tanstack/react-query`](https://tanstack.com/query) avoids the overhead of a full Apollo/urql cache setup.

```bash
npm install graphql-request @tanstack/react-query
```

```tsx
import { useQuery } from '@tanstack/react-query';
import { request, gql } from 'graphql-request';

const endpoint = 'https://services.uniqueflooring.co.za/graphql';

const GET_FLOORING = gql`
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
`;

function useFlooring() {
  return useQuery({
    queryKey: ['flooring'],
    queryFn: () => request(endpoint, GET_FLOORING),
  });
}

function FlooringList() {
  const { data, isLoading, error } = useFlooring();

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Failed to load flooring.</p>;

  return (
    <ul>
      {data.flooring.map((item) => (
        <li key={item.id}>{item.name} ({item.flooringType.name})</li>
      ))}
    </ul>
  );
}
```

If your team already uses Apollo Client or urql, both work the same way against this endpoint. No special configuration is needed since there's no auth header to attach for catalog queries.

---

## Node.js / TypeScript backend

Same `graphql-request` library works server-side for backend-to-backend calls where you don't need React Query's caching:

```bash
npm install graphql-request
```

```ts
import { request, gql } from 'graphql-request';

const endpoint = 'https://services.uniqueflooring.co.za/graphql';

interface GetFlooringResult {
  flooring: {
    id: string;
    name: string;
    price: number;
    stockQuantity: number | null;
    leadTimeDays: number | null;
    minReorderQuantity: number | null;
    maxReorderQuantity: number | null;
    flooringType: { name: string };
  }[];
}

const GET_FLOORING = gql`
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
`;

async function getEnabledFlooring() {
  const data = await request<GetFlooringResult>(endpoint, GET_FLOORING);
  return data.flooring;
}
```

---

## Any other language: raw HTTP

Every example above reduces to the same thing under the hood: an HTTP POST with a JSON body containing the query. If your stack isn't listed, this is all you need:

```bash
curl -X POST https://services.uniqueflooring.co.za/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ flooring(where: { enabled: { eq: true } }) { id name price } }"}'
```

Any HTTP client library in any language can send this request. No GraphQL-specific tooling is required.

---

## Errors

All examples above should check for GraphQL errors in the response before trusting the data. See [Error Handling](/errors) for the error shape and codes returned by this API.
