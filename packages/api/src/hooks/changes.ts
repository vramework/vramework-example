import { useState, useCallback, useRef, useEffect } from 'react'
import equal from 'fast-deep-equal/react'
import React from 'react'
import { GeneralFormFields } from '@databuilder/types/src/fields'
import { GenericGetUpdate } from './generic-crud'
import { EntityType } from '@databuilder/types/src/general'

function mergeData<T>(original: T, data: Partial<T>): T {
  if (!data) {
    return original
  }
  const result: Partial<T> = {}
  for (const k in original) {
    result[k] = data[k] !== undefined ? data[k] : original[k]
  }
  return result as T
}

export type OnDataChange = (value: string | string[] | boolean | number | Date | null, field: string) => void
export type OnDataChanges = (data: {
  [index: string]: string | string[] | boolean | number | Date | any | null
}) => void
export interface ChangedDataHook<T> {
  data: T
  changedData: Partial<T>
  changedDataRef: { current: Partial<T> }
  onChange: OnDataChange
  onChanges: OnDataChanges
}

export const useChangedData = <T extends unknown>(original: T): ChangedDataHook<T> => {
  const data = useRef<T>(original)
  const cd = useRef<Partial<T>>({})
  const og = useRef<T>(original)
  og.current = original

  const [, setChangedNotifier] = useState<number>(0)
  const mergeChange = useCallback(() => {
    const merged = mergeData(og.current, cd.current)
    if (!equal(merged, data.current)) {
      data.current = merged
      setChangedNotifier(Math.random())
    }
    if (equal(og.current, merged) && !equal(cd.current, {})) {
      cd.current = {}
      setChangedNotifier(Math.random())
    }
  }, [])
  useEffect(() => {
    mergeChange()
  }, [original])
  const onChange = useCallback((value, field) => {
    if ((cd.current as any)[field] !== value) {
      (cd.current as any)[field] = value
      mergeChange()
    }
  }, [])
  const onChanges = useCallback((data) => {
    cd.current = { ...cd.current, ...data }
    mergeChange()
  }, [])
  return { data: data.current, changedData: cd.current, onChange, onChanges, changedDataRef: cd }
}

export const useBlankChangeFromFields = <Type extends Object>(entityType: EntityType, fields: GeneralFormFields): GenericGetUpdate<Type> => {
  const original = React.useMemo(
    () =>
      fields.reduce((r, k) => {
        r[k.field] = null
        return r
      }, {} as any),
    [],
  )

  const originalRef = useRef(original)
  originalRef.current = original

  const changed = useChangedData<Type>(original)
  const saveChanges = useCallback(async () => {
    // handled externally
  }, [])
  const saveChange = useCallback(async () => {
    // Does nothing since object doesnt yet exist
  }, [])

  const totalFieldLength = Object.keys(original).length
  return {
    entityType,
    totalFieldLength,
    missingFieldsLength: Object.values(changed.data).reduce((r: number, v) => (v === null ? ++r : r), 0),
    saveChanges,
    saveChange,
    state: 'ready',
    saveError: null,
    hasChange: Object.keys(changed.changedData).length !== 0,
    ...changed,
  }
}
