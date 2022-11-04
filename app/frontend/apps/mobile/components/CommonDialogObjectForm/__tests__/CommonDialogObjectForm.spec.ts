// Copyright (C) 2012-2022 Zammad Foundation, https://zammad-foundation.org/

import { keyBy } from 'lodash-es'
import { useMutation } from '@vue/apollo-composable'
import gql from 'graphql-tag'
import { closeDialog } from '@shared/composables/useDialog'
import {
  mockOrganizationObjectAttributes,
  organizationObjectAttributes,
} from '@mobile/entities/organization/__tests__/mocks/organization-mocks'
import { defineFormSchema } from '@mobile/form/defineFormSchema'
import { EnumObjectManagerObjects } from '@shared/graphql/types'
import { renderComponent } from '@tests/support/components'
import { MutationHandler } from '@shared/server/apollo/handler'
import { waitUntilApisResolved } from '@tests/support/utils'
import CommonDialogForm from '../CommonDialogObjectForm.vue'

vi.mock('@shared/composables/useDialog')

const renderForm = () => {
  const attributesResult = organizationObjectAttributes()
  const attributes = keyBy(attributesResult.attributes, 'name')
  const attributesApi = mockOrganizationObjectAttributes(attributesResult)
  const organization = {
    id: 'faked-id',
    name: 'Some Organization',
    shared: true,
    domain_assignment: false,
    domain: '',
    note: '',
    active: false,
    objectAttributeValues: [
      { attribute: attributes.textarea, value: 'old value' },
      { attribute: attributes.test, value: 'some test' },
    ],
  }

  const sendMock = vi.fn().mockResolvedValue(organization)
  MutationHandler.prototype.send = sendMock
  const view = renderComponent(CommonDialogForm, {
    props: {
      name: 'organization',
      object: organization,
      type: EnumObjectManagerObjects.Organization,
      schema: defineFormSchema([
        {
          screen: 'edit',
          object: EnumObjectManagerObjects.Organization,
        },
      ]),
      mutation: useMutation(
        gql`
          mutation {
            organizationUpdate
          }
        `,
      ),
    },
    form: true,
    formField: true,
    conformation: true,
  })
  return {
    attributesApi,
    sendMock,
    organization,
    attributes,
    view,
  }
}

test('can update default object', async () => {
  const { attributesApi, view, sendMock, organization } = renderForm()

  await waitUntilApisResolved(attributesApi)

  const attributeValues = keyBy(
    organization.objectAttributeValues,
    'attribute.name',
  )

  const name = view.getByLabelText('Name')
  const shared = view.getByLabelText('Shared organization')
  const domainAssignment = view.getByLabelText('Domain based assignment')
  const domain = view.getByLabelText('Domain')
  const active = view.getByLabelText('Active')
  const textarea = view.getByLabelText('Textarea Field')
  const test = view.getByLabelText('Test Field')

  expect(name).toHaveValue(organization.name)
  expect(shared).toHaveValue('yes')
  expect(domainAssignment).toHaveValue('no')
  expect(domain).toHaveValue(organization.domain)
  expect(active).not.toBeChecked()
  expect(textarea).toHaveValue(attributeValues.textarea.value)
  expect(test).toHaveValue(attributeValues.test.value)

  await view.events.type(name, ' 2')

  await view.events.click(shared)
  let selectOptions = view.getAllByRole('option')
  await view.events.click(selectOptions[1])

  await view.events.click(domainAssignment)
  selectOptions = view.getAllByRole('option')
  await view.events.click(selectOptions[0])

  await view.events.type(domain, 'some-domain@domain.me')
  await view.events.click(active)

  await view.events.clear(textarea)
  await view.events.type(textarea, 'new value')

  await view.events.click(view.getByRole('button', { name: 'Save' }))

  expect(sendMock).toHaveBeenCalledOnce()
  expect(sendMock).toHaveBeenCalledWith({
    id: organization.id,
    input: {
      name: 'Some Organization 2',
      shared: false,
      domain: 'some-domain@domain.me',
      domainAssignment: true,
      active: true,
      note: '',
      objectAttributeValues: [
        { name: 'test', value: 'some test' },
        { name: 'textarea', value: 'new value' },
      ],
    },
  })
  expect(closeDialog).toHaveBeenCalled()
})

it('doesnt close dialog, if result is unsuccessfull', async () => {
  const { attributesApi, view, sendMock } = renderForm()

  await waitUntilApisResolved(attributesApi)
  sendMock.mockResolvedValue(null)

  await view.events.click(view.getByRole('button', { name: 'Save' }))

  expect(sendMock).toHaveBeenCalledOnce()
  expect(closeDialog).not.toHaveBeenCalled()
})

it('doesnt call api, if dialog is closed', async () => {
  const { attributesApi, view, sendMock } = renderForm()

  await waitUntilApisResolved(attributesApi)

  await view.events.type(view.getByLabelText('Name'), ' 2')
  await view.events.click(view.getByRole('button', { name: 'Cancel' }))

  await view.events.click(await view.findByText('OK'))

  expect(sendMock).not.toHaveBeenCalledOnce()
  expect(closeDialog).toHaveBeenCalled()
})
