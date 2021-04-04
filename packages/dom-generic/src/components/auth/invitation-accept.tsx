import * as React from 'react'
import { FunctionComponent, useCallback, useState } from 'react'
import styles from './auth.module.css'
import { useRouter } from 'next/router'
import { useChangedData } from '@databuilder/api/src/hooks/changes'
import { AuthHeader } from './auth-header'
import { InputField } from '../field/input-field'
import { useI18n } from '@databuilder/api/src/contexts/i18n'
import { acceptInvitationRest } from '@databuilder/api/src/rest/user'
import { validatePassword } from '@databuilder/api/src/utils/password-check'

function parseJwt(token: string) {
  const base64Url = token.split('.')[1]
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      })
      .join(''),
  )

  return JSON.parse(jsonPayload)
}

export const InvitationAccept: FunctionComponent = () => {
  const i18n = useI18n()
  const router = useRouter()
  const { hash } = router.query as { hash: string }

  const original = React.useRef({
    password: '',
  })
  const { data, onChange } = useChangedData(original.current)
  const [error, setError] = useState<string | undefined>()
  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const { password } = data

      const passwordValid = validatePassword(password)
      if (!passwordValid) {
        setError(i18n.get('auth.invalid_password'))
        return
      }
      try {
        await acceptInvitationRest({ hash, password })
      } catch (e) {
        setError(i18n.get('auth.error_accepting_invitation'))
      }
    },
    [data],
  )

  const invalidMessages = {
    missing: i18n.get('auth.missing_invitation_hash'),
    expired: i18n.get('auth.invalid_invitation_hash'),
    invalid: i18n.get('auth.invalid_invitation_hash'),
  }

  let invalidMessage = null
  try {
    if (!hash) {
      invalidMessage = invalidMessages.missing
    } else {
      const jwt = parseJwt(hash)
      if (Date.now() > jwt.exp * 1000) {
        invalidMessage = invalidMessages.expired
      }
    }
  } catch (e) {
    invalidMessage = invalidMessages.invalid
  }

  const ResetForm = (
    <form className={styles.form} onSubmit={onSubmit}>
      <InputField
        field="password"
        label={i18n.get('auth.new_password')}
        value={data.password}
        onChange={onChange}
        type="password"
        autoComplete="new-password"
      />
      {error && <div className={styles.error}>{error}</div>}
      <button className={styles.action}>{i18n.get('auth.accept_invitation')}</button>
    </form>
  )

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <AuthHeader />
        {invalidMessage ? <div>{invalidMessage}</div> : ResetForm}
      </div>
    </div>
  )
}
