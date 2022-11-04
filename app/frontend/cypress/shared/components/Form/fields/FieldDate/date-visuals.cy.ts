// Copyright (C) 2012-2022 Zammad Foundation, https://zammad-foundation.org/

// To update snapshots, run `yarn cypress:snapshots`
// DO NOT update snapshots, when running with --open flag (Cypress GUI)

import { mountFormField, checkFormMatchesSnapshot } from '@cy/utils'
import { FormValidationVisibility } from '@shared/components/Form/types'

describe('testing visuals for "FieldDate"', () => {
  const inputs = [
    { type: 'date', input: '2021-01-01' },
    { type: 'datetime', input: '2021-01-01 13:12' },
  ]

  inputs.forEach(({ type, input }) => {
    it(`renders basic ${type}`, () => {
      mountFormField(type, { label: 'Date', maxDate: '2021-02-01' })
      checkFormMatchesSnapshot('basic', type)
      cy.findByLabelText('Date')
        .focus()
        .then(() => {
          checkFormMatchesSnapshot('basic - focused', type)
        })
      cy.findByLabelText('Date')
        .type(`${input}{enter}`)
        .then(() => {
          checkFormMatchesSnapshot('basic - filled', type)
        })
    })

    it(`renders required ${type}`, () => {
      mountFormField(type, {
        label: 'Date',
        required: true,
        maxDate: '2021-02-01',
      })
      checkFormMatchesSnapshot('required', type)
      cy.findByLabelText('Date')
        .focus()
        .then(() => {
          checkFormMatchesSnapshot('required - focused', type)
        })
      cy.findByLabelText('Date')
        .type(`${input}{enter}`)
        .then(() => {
          checkFormMatchesSnapshot('required - filled', type)
        })
    })

    it('renders invalid', () => {
      mountFormField(type, {
        label: 'Date',
        required: true,
        maxDate: '2021-02-01',
        validationVisibility: FormValidationVisibility.Live,
      })
      checkFormMatchesSnapshot('required - invalid', type)
    })

    it('renders linked', () => {
      mountFormField(type, { label: 'Date', link: '/', maxDate: '2021-02-01' })
      checkFormMatchesSnapshot('linked', type)
      cy.findByLabelText('Date')
        .focus()
        .then(() => {
          checkFormMatchesSnapshot('linked - focused', type)
        })
      cy.findByLabelText('Date')
        .type(`${input}{enter}`)
        .then(() => {
          checkFormMatchesSnapshot('linked - filled', type)
        })
    })

    it('renders disabled', () => {
      mountFormField('date', {
        label: 'Date',
        disabled: true,
        maxDate: '2021-02-01',
      })
      checkFormMatchesSnapshot('disabled', type)
    })
  })
})
