// Copyright (C) 2012-2022 Zammad Foundation, https://zammad-foundation.org/

import type {
  FormKitClasses,
  FormKitGroupValue,
  FormKitPlugin,
  FormKitSchemaAttributes,
  FormKitSchemaCondition,
  FormKitSchemaNode,
} from '@formkit/core'
import type {
  FormKitValidationMessages,
  FormKitValidationRules,
} from '@formkit/validation'
import type { EnumObjectManagerObjects } from '@shared/graphql/types'
import type { Except, Primitive, SetOptional, SetRequired } from 'type-fest'

export interface FormFieldAdditionalProps {
  [index: string]: unknown
}

type SimpleFormFieldValue = Primitive | Primitive[]

export type FormFieldValue =
  | SimpleFormFieldValue
  | SimpleFormFieldValue[]
  | Record<string, SimpleFormFieldValue>

// https://formkit.com/essentials/validation#showing-errors
export enum FormValidationVisibility {
  Blur = 'blur',
  Live = 'live',
  Dirty = 'dirty',
  Submit = 'submit',
}

export type AllowedClasses = string | Record<string, boolean> | FormKitClasses

export interface FormSchemaField {
  show?: boolean
  relation?: {
    type: string
    filterIds?: number[]
  }
  updateFields?: boolean
  triggerFormUpdater?: boolean
  type: string
  name: string
  value?: FormFieldValue
  label?: string
  placeholder?: string
  help?: string
  disabled?: boolean
  required?: boolean
  delay?: number
  errors?: string[]
  hidden?: boolean
  id?: string
  sectionsSchema?: Record<
    string,
    Partial<FormKitSchemaNode> | FormKitSchemaCondition
  >
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validation?: string | Array<[rule: string, ...args: any]>
  validationMessages?: FormKitValidationMessages
  validationVisibility?: Exclude<
    FormValidationVisibility,
    FormValidationVisibility.Submit
  >
  validationRules?: FormKitValidationRules
  config?: Record<string, unknown>
  plugins?: FormKitPlugin[]
  classes?: AllowedClasses
  props?: FormFieldAdditionalProps
  outerClass?: AllowedClasses
  wrapperClass?: AllowedClasses
  labelClass?: AllowedClasses
  prefixClass?: AllowedClasses
  innerClass?: AllowedClasses
  suffixClass?: AllowedClasses
  inputClass?: AllowedClasses
  helpClass?: AllowedClasses
  messagesClass?: AllowedClasses
  messageClass?: AllowedClasses
}

export interface FormSchemaGroupOrList {
  isGroupOrList: boolean
  type: 'group' | 'list'
  name: string
}

interface FormSchemaLayoutBase {
  isLayout: boolean
  hidden?: string
}

export interface FormSchemaComponent extends FormSchemaLayoutBase {
  component: string
  props?: {
    [index: string]: unknown
  }
}

export interface FormSchemaDOMElement extends FormSchemaLayoutBase {
  element: string
  attrs?: FormKitSchemaAttributes
}

export interface FormSchemaFieldsForObjectAttributeScreen {
  screen: string
  object: EnumObjectManagerObjects
}

export type FormSchemaFieldObjectAttribute = SetRequired<
  Partial<FormSchemaField>,
  'name'
> & {
  screen?: string
  object: EnumObjectManagerObjects
}

export type FormSchemaLayout = FormSchemaComponent | FormSchemaDOMElement

export type FormSchemaNodeWithChildren = (
  | FormSchemaLayout
  | FormSchemaGroupOrList
) & {
  children:
    | (
        | FormSchemaField
        | FormSchemaFieldObjectAttribute
        | FormSchemaFieldsForObjectAttributeScreen
        | FormSchemaNodeWithChildren
        | string
      )[]
    | string
}

export type FormSchemaNode =
  | FormSchemaNodeWithChildren
  | FormSchemaField
  | FormSchemaFieldObjectAttribute
  | FormSchemaFieldsForObjectAttributeScreen
  | string

export interface ReactiveFormSchemData {
  fields: Record<
    string,
    {
      show: boolean
      updateFields: boolean
      props: Except<
        SetOptional<FormSchemaField, 'type'>,
        'show' | 'props' | 'updateFields'
      >
    }
  >
}

export interface FormValues {
  [index: string]: FormFieldValue
}

export type FormData<TFormValues = FormValues> = FormKitGroupValue &
  TFormValues & {
    formId: string
  }
