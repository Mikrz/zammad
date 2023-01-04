// Copyright (C) 2012-2023 Zammad Foundation, https://zammad-foundation.org/

import { TicketState } from '@shared/entities/ticket/types'
import type { TicketArticlesQuery, TicketQuery } from '@shared/graphql/types'
import { convertToGraphQLId } from '@shared/graphql/utils'
import type { ExtendedIMockSubscription } from '@tests/support/mock-graphql-api'
import {
  mockGraphQLApi,
  mockGraphQLSubscription,
} from '@tests/support/mock-graphql-api'
import { nullableMock, waitUntil } from '@tests/support/utils'

import { TicketDocument } from '../../graphql/queries/ticket.api'

import { TicketArticlesDocument } from '../../graphql/queries/ticket/articles.api'
import { TicketUpdatesDocument } from '../../graphql/subscriptions/ticketUpdates.api'

const ticketDate = new Date(2022, 0, 29, 0, 0, 0, 0)

export const defaultTicket = () =>
  nullableMock<TicketQuery>({
    ticket: {
      __typename: 'Ticket',
      id: convertToGraphQLId('Ticket', 1),
      internalId: 1,
      number: '610001',
      title: 'Test Ticket View',
      createdAt: ticketDate.toISOString(),
      updatedAt: ticketDate.toISOString(),
      pendingTime: null,
      subscribed: false,
      mentions: null,
      policy: {
        update: true,
      },
      owner: {
        __typename: 'User',
        internalId: 100,
        id: convertToGraphQLId('User', 100),
        firstname: 'Max',
        lastname: 'Mustermann',
      },
      customer: {
        __typename: 'User',
        id: convertToGraphQLId('User', 200),
        internalId: 200,
        firstname: 'John',
        lastname: 'Doe',
        fullname: 'John Doe',
        policy: {
          __typename: 'Policy',
          update: true,
        },
      },
      organization: {
        __typename: 'Organization',
        id: convertToGraphQLId('Organization', 300),
        internalId: 300,
        name: 'Zammad Foundation',
      },
      state: {
        __typename: 'TicketState',
        id: convertToGraphQLId('Ticket::State', 2),
        name: 'open',
        stateType: {
          __typename: 'TicketStateType',
          name: TicketState.Open,
        },
      },
      group: {
        __typename: 'Group',
        id: convertToGraphQLId('Group', 1),
        name: 'Users',
      },
      priority: {
        __typename: 'TicketPriority',
        id: convertToGraphQLId('Ticket::Priority', 1),
        name: '1 low',
        uiColor: 'low',
        defaultCreate: false,
      },
      objectAttributeValues: [],
    },
  })

const address = {
  __typename: 'AddressesField' as const,
  parsed: null,
  raw: '',
}

export const defaultArticles = (): TicketArticlesQuery =>
  nullableMock({
    description: {
      __typename: 'TicketArticleConnection',
      edges: [
        {
          __typename: 'TicketArticleEdge',
          node: {
            __typename: 'TicketArticle',
            id: '1fs4323qr32d',
            internalId: 1,
            createdAt: ticketDate.toISOString(),
            to: address,
            replyTo: address,
            cc: address,
            from: address,
            createdBy: {
              __typename: 'User',
              id: 'fdsf214fse12d',
              firstname: 'John',
              lastname: 'Doe',
              fullname: 'John Doe',
            },
            internal: false,
            body: '<p>Body <b>of a test ticket</b></p>',
            sender: {
              __typename: 'TicketArticleSender',
              name: 'Customer',
            },
            type: {
              __typename: 'TicketArticleType',
              name: 'article',
            },
            contentType: 'text/html',
            attachments: [
              // should not be visible
              {
                __typename: 'StoredFile',
                internalId: 66,
                name: 'not-visible-attachment.png',
                type: 'image/png',
                size: 0,
                preferences: {
                  'original-format': true,
                },
              },
            ],
            preferences: {},
          },
        },
      ],
    },
    articles: {
      __typename: 'TicketArticleConnection',
      totalCount: 3,
      edges: [
        {
          __typename: 'TicketArticleEdge',
          node: {
            __typename: 'TicketArticle',
            id: '1fs432fdsfsg3',
            internalId: 2,
            to: address,
            replyTo: address,
            cc: address,
            from: address,
            createdAt: new Date(2022, 0, 30, 0, 0, 0, 0).toISOString(),
            createdBy: {
              __typename: 'User',
              id: 'dsvvr32532fs',
              firstname: 'Albert',
              lastname: 'Einstein',
              fullname: 'Albert Einstein',
            },
            internal: false,
            body: '<p>energy equals power times time</p>',
            sender: {
              __typename: 'TicketArticleSender',
              name: 'Agent',
            },
            type: {
              __typename: 'TicketArticleType',
              name: 'article',
            },
            attachments: [],
            preferences: {},
            contentType: 'text/html',
          },
          cursor: 'MH',
        },
        {
          __typename: 'TicketArticleEdge',
          node: {
            __typename: 'TicketArticle',
            id: '1fs4sfsg3qr30f',
            internalId: 3,
            to: address,
            replyTo: address,
            cc: address,
            from: address,
            createdAt: new Date(2022, 0, 30, 10, 0, 0, 0).toISOString(),
            createdBy: {
              __typename: 'User',
              id: 'fsfy345343f',
              firstname: 'Monkey',
              lastname: 'Brain',
              fullname: 'Monkey Brain',
            },
            internal: true,
            body: '<p>only agents can see this haha</p>',
            sender: {
              __typename: 'TicketArticleSender',
              name: 'Agent',
            },
            type: {
              __typename: 'TicketArticleType',
              name: 'article',
            },
            contentType: 'text/html',
            attachments: [],
            preferences: {},
          },
          cursor: 'MI',
        },
      ],
      pageInfo: {
        __typename: 'PageInfo',
        hasPreviousPage: false,
        startCursor: 'MH',
      },
    },
  })

interface MockOptions {
  mockSubscription?: boolean
  ticket?: TicketQuery
}

export const mockTicketGql = (ticket: TicketQuery = defaultTicket()) => {
  const mockApiTicket = mockGraphQLApi(TicketDocument).willResolve(ticket)

  const waitUntilTicketLoaded = async () => {
    await waitUntil(() => mockApiTicket.calls.resolve)
  }

  return {
    mockApiTicket,
    waitUntilTicketLoaded,
  }
}

export const mockTicketDetailViewGql = (options: MockOptions = {}) => {
  const { mockSubscription = true } = options

  const ticket = options.ticket || defaultTicket()

  const mockApiTicket = mockGraphQLApi(TicketDocument).willResolve(ticket)
  const mockApiArticles = mockGraphQLApi(TicketArticlesDocument).willResolve(
    defaultArticles(),
  )
  let mockTicketSubscription: ExtendedIMockSubscription
  if (mockSubscription) {
    mockTicketSubscription = mockGraphQLSubscription(TicketUpdatesDocument)
  } else {
    mockTicketSubscription = {} as ExtendedIMockSubscription
  }

  const waitUntilTicketLoaded = async () => {
    await waitUntil(
      () => mockApiTicket.calls.resolve && mockApiArticles.calls.resolve,
    )
  }

  return {
    ticket: ticket.ticket,
    mockApiArticles,
    mockApiTicket,
    mockTicketSubscription,
    waitUntilTicketLoaded,
  }
}
