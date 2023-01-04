# Copyright (C) 2012-2023 Zammad Foundation, https://zammad-foundation.org/

module Gql::Types::Input::Ticket
  class ArticleInputType < Gql::Types::BaseInputObject
    description 'Represents the article attributes to be used in ticket create/update.'

    argument :body, String, required: false, description: 'The article body.'
    argument :subject, String, required: false, description: 'The article subject.'
    argument :internal, Boolean, required: false, description: 'Whether the article is internal.'
    argument :ticket_id, GraphQL::Types::ID, required: false, description: 'The ticket the article belongs to.', loads: Gql::Types::TicketType
    argument :type, String, required: false, description: 'The article type.'
    argument :sender, String, required: false, description: 'The article sender.'
    argument :from, String, required: false, description: 'The article sender address.'
    argument :to, String, required: false, description: 'The article recipient address.'
    argument :cc, String, required: false, description: 'The article CC address.'
    argument :content_type, String, required: false, description: 'The article content type.'
    argument :time_unit, Float, required: false, description: 'The article accounted time.'
    argument :preferences, GraphQL::Types::JSON, required: false, description: 'The article preferences.'
    argument :attachments, Gql::Types::Input::AttachmentInputType, required: false, description: 'The article attachments.'

    transform :transform_type
    transform :transform_sender
    transform :transform_customer_article

    def transform_type(payload)
      payload.to_h.tap do |result|
        result[:type] = Ticket::Article::Type.lookup(name: result[:type].presence || 'note')
      end
    end

    def transform_sender(payload)
      sender_name = context.current_user.permissions?('ticket.agent') ? 'Agent' : 'Customer'
      article_sender = payload[:sender].presence || sender_name

      payload[:sender] = Ticket::Article::Sender.lookup(name: article_sender)

      payload
    end

    def transform_customer_article(payload)
      return payload if context.current_user.permissions?('ticket.agent')

      payload[:sender] = Ticket::Article::Sender.lookup(name: 'Customer')

      if payload[:type].name.match?(%r{^(note|web)$})
        payload[:type] = Ticket::Article::Type.lookup(name: 'note')
      end

      payload[:internal] = false

      payload
    end
  end
end
