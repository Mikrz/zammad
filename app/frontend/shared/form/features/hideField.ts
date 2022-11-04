// Copyright (C) 2012-2022 Zammad Foundation, https://zammad-foundation.org/

import type { FormKitNode } from '@formkit/core'

const hideField = (node: FormKitNode) => {
  node.addProps(['hidden'])

  node.on('created', () => {
    const { props } = node

    if (props.hidden) {
      props.outerClass = 'hidden'
    }

    node.on('prop:hidden', ({ payload }) => {
      if (payload) {
        props.outerClass = `${props.outerClass} hidden`
      } else {
        props.outerClass = props.outerClass.replace('hidden', '')
      }
    })
  })
}

export default hideField
