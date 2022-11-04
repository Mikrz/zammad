# Copyright (C) 2012-2022 Zammad Foundation, https://zammad-foundation.org/

require 'rails_helper'

describe TicketPolicy do
  subject(:policy) { described_class.new(user, record) }

  let(:record) { create(:ticket) }

  context 'when given ticket’s owner' do
    let(:user) { record.owner }

    it { is_expected.to forbid_actions(%i[show full]) }

    context 'when owner has ticket.agent permission' do

      let(:user) do
        create(:agent, groups: [record.group]).tap do |user|
          record.update!(owner: user)
        end
      end

      it { is_expected.to permit_actions(%i[show full]) }
    end
  end

  context 'when given user that is agent and customer' do
    let(:user) { create(:agent_and_customer, groups: [record.group]) }

    it { is_expected.to permit_actions(%i[show full]) }
  end

  context 'when given a user that is neither owner nor customer' do
    let(:user) { create(:agent) }

    it { is_expected.to forbid_actions(%i[show full]) }

    context 'but the user is an agent with full access to ticket’s group' do
      before { user.group_names_access_map = { record.group.name => 'full' } }

      it { is_expected.to permit_actions(%i[show full]) }
    end

    context 'but the user is a customer from the same organization as ticket’s customer' do
      let(:record)   { create(:ticket, customer: customer) }
      let(:customer) { create(:customer, organization: create(:organization)) }
      let(:user)     { create(:customer, organization: customer.organization) }

      context 'and organization.shared is true (default)' do

        it { is_expected.to permit_actions(%i[show full]) }
      end

      context 'but organization.shared is false' do
        before { customer.organization.update(shared: false) }

        it { is_expected.to forbid_actions(%i[show full]) }
      end
    end

    context 'when user is admin with group access' do
      let(:user) { create(:user, roles: Role.where(name: %w[Admin])) }

      it { is_expected.to forbid_actions(%i[show full]) }
    end
  end

  context 'when user is agent' do

    context 'when owner has ticket.agent permission' do

      let(:user) do
        create(:agent, groups: [record.group]).tap do |user|
          record.update!(owner: user)
        end
      end

      it { is_expected.to permit_actions(%i[show full]) }
    end

    context 'when groups.follow_up_possible is set' do
      let(:record)   { create(:ticket, customer: customer, group: group, state: Ticket::State.find_by(name: 'closed')) }
      let(:customer) { create(:customer, organization: create(:organization)) }
      let(:user)     { create(:agent) }

      context 'to yes' do
        let(:group) { create(:group, follow_up_possible: 'yes') }

        it { is_expected.to permit_actions(%i[follow_up]) }
      end

      context 'to new_ticket' do
        let(:group) { create(:group, follow_up_possible: 'new_ticket') }

        it { is_expected.to permit_actions(%i[follow_up]) }
      end

      context 'to new_ticket_after_certain_time' do
        let(:group) { create(:group, follow_up_possible: 'new_ticket_after_certain_time', reopen_time_in_days: 2) }

        context 'when reopen_time_in_days is within configured time frame' do
          it { is_expected.to permit_actions(%i[follow_up]) }
        end

        context 'when reopen_time_in_days is outside configured time frame' do
          before do
            policy
            travel 3.days
          end

          it { is_expected.to permit_actions(%i[follow_up]) }
        end
      end

    end

  end

  context 'when user is customer' do
    context 'when groups.follow_up_possible is yes' do
      let(:record) { create(:ticket, customer: user, group: group, state: Ticket::State.find_by(name: 'closed')) }
      let(:group)  { create(:group, follow_up_possible: 'yes') }
      let(:user)   { create(:customer, organization: create(:organization)) }

      it { is_expected.to permit_actions(%i[follow_up]) }
    end

    context 'when groups.follow_up_possible is new_ticket' do
      let(:record) { create(:ticket, customer: user, group: group, state: Ticket::State.find_by(name: 'closed')) }
      let(:group)  { create(:group, follow_up_possible: 'new_ticket') }
      let(:user)   { create(:customer, organization: create(:organization)) }

      it { is_expected.to forbid_action(:follow_up) }
      it { expect { policy.follow_up? }.to change(policy, :custom_exception).to(Exceptions::UnprocessableEntity) }
    end

    context 'when groups.follow_up_possible is new_ticket_after_certain_time' do
      let(:record) { create(:ticket, customer: user, group: group, state: Ticket::State.find_by(name: 'closed')) }
      let(:group)  { create(:group, follow_up_possible: 'new_ticket_after_certain_time', reopen_time_in_days: 2) }
      let(:user)   { create(:customer, organization: create(:organization)) }

      context 'when reopen_time_in_days is within reopen time frame' do
        it { is_expected.to permit_actions(%i[follow_up]) }
      end

      context 'when reopen_time_in_days is without reopen time frame' do
        before do
          policy
          travel 3.days
        end

        it { is_expected.to forbid_action(:follow_up) }
        it { expect { policy.follow_up? }.to change(policy, :custom_exception).to(Exceptions::UnprocessableEntity) }
      end
    end

  end
end
