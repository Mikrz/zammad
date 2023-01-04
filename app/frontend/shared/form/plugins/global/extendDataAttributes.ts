// Copyright (C) 2012-2023 Zammad Foundation, https://zammad-foundation.org/

import { isEmpty } from 'lodash-es'
import type { FormKitNode } from '@formkit/core'
import type { FormKitValidation } from '@formkit/validation'
import extendSchemaDefinition from '@shared/form/utils/extendSchemaDefinition'

const extendDataAttribues = (node: FormKitNode) => {
  const { props, context } = node

  if (!props.definition || !context || node.type !== 'input') return

  // Add the parsedRules as props, so that the value is reactive and
  // `$parsedRules` can be used in the if condition (https://github.com/formkit/formkit/issues/356).
  node.addProps(['parsedRules'])

  // Adds a helper function to check the existing value inside of the context.
  context.fns.hasValue = (value: unknown): boolean => {
    if (typeof value === 'object') return !isEmpty(value)

    return value != null && value !== ''
  }

  context.fns.hasRule = (
    parsedRules: FormKitValidation[],
    ruleName: string,
  ) => {
    return parsedRules.some((rule) => rule.name === ruleName)
  }

  extendSchemaDefinition(node, 'outer', {
    attrs: {
      'data-populated': {
        if: '$fns.hasValue($value)',
        then: 'true',
        else: undefined,
      },
      'data-required': {
        if: "$fns.hasRule($parsedRules, 'required')",
        then: 'true',
        else: undefined,
      },
      'data-dirty': {
        if: '$state.dirty',
        then: 'true',
        else: undefined,
      },
    },
  })
}

export default extendDataAttribues
