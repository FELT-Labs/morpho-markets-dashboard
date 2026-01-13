import { GraphQLClient } from 'graphql-request'

const endpoint = process.env.NEXT_PUBLIC_MORPHO_API_URL || 'https://api.morpho.org/graphql'

export const graphQLClient = new GraphQLClient(endpoint, {
  headers: {
    'Content-Type': 'application/json',
  },
})
