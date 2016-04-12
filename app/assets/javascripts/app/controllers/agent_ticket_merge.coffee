class App.TicketMerge extends App.ControllerModal
  buttonClose: true
  buttonCancel: true
  buttonSubmit: true
  head: 'Merge'
  shown: false

  constructor: ->
    super
    @fetch()

  fetch: ->
    @ajax(
      id:    'ticket_related'
      type:  'GET'
      url:   "#{@apiPath}/ticket_related/#{@ticket.id}"
      processData: true
      success: (data, status, xhr) =>
        App.Collection.loadAssets(data.assets)
        @ticket_ids_by_customer    = data.ticket_ids_by_customer
        @ticket_ids_recent_viewed  = data.ticket_ids_recent_viewed
        @render()
    )

  content: =>
    content = $( App.view('agent_ticket_merge')() )

    new App.TicketList(
      el:         content.find('#ticket-merge-customer-tickets')
      ticket_ids: @ticket_ids_by_customer
      radio:      true
    )

    new App.TicketList(
      el:         content.find('#ticket-merge-recent-tickets')
      ticket_ids: @ticket_ids_recent_viewed
      radio:      true
    )

    content.delegate('[name="master_ticket_number"]', 'focus', (e) ->
      $(e.target).parents().find('[name="radio"]').prop('checked', false)
    )

    content.delegate('[name="radio"]', 'click', (e) ->
      if $(e.target).prop('checked')
        ticket_id = $(e.target).val()
        ticket    = App.Ticket.fullLocal(ticket_id)
        $(e.target).parents().find('[name="master_ticket_number"]').val(ticket.number)
    )

    content

  onSubmit: (e) =>
    @formDisable(e)
    params = @formParam(e.target)

    # merge tickets
    @ajax(
      id:    'ticket_merge'
      type:  'GET'
      url:   "#{@apiPath}/ticket_merge/#{@ticket.id}/#{params['master_ticket_number']}"
      processData: true,
      success: (data, status, xhr) =>

        if data['result'] is 'success'

          # update collection
          App.Collection.load(type: 'Ticket', data: [data.master_ticket])
          App.Collection.load(type: 'Ticket', data: [data.slave_ticket])

          # hide dialog
          @close()

          # view ticket
          @log 'notice', 'nav...', App.Ticket.find(data.master_ticket['id'])
          @navigate '#ticket/zoom/' + data.master_ticket['id']

          # notify UI
          @notify
            type:    'success'
            msg:     App.i18n.translateContent('Ticket %s merged!', data.slave_ticket['number'])
            timeout: 4000

          App.TaskManager.remove("Ticket-#{data.slave_ticket['id']}")

        else

          # notify UI
          @notify
            type:    'error'
            msg:     App.i18n.translateContent(data['message'])
            timeout: 6000

          @formEnable(e)

      error: =>
        @formEnable(e)
    )
