import { useChangedData } from '@databuilder/api/src/hooks/changes'
import { useI18n } from '@databuilder/api/src/contexts/i18n'

import * as React from 'react'
import { FunctionComponent, useCallback, useRef } from 'react'
import { InputField } from '../field/input-field'
import styles from './auth.module.css'
import { AuthHeader } from './auth-header'
import Link from 'next/link'

export const Login: FunctionComponent<{ action: Function }> = ({ action }) => {
  const i18n = useI18n()

  const [error, setError] = React.useState<string>()
  const original = useRef({
    email: '',
    password: '',
    staySignedIn: false,
  })
  const { data, onChange } = useChangedData(original.current)
  const { email, password, staySignedIn } = data

  const onLogin = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      try {
        await action({ email, password })
        window.location.href = '/'
      } catch (err) {
        if (err.status === 401) {
          setError(i18n.get('auth.login_error'))
        } else {
          setError(i18n.get('auth.server_down'))
        }
      }
    },
    [data],
  )

  const canLogin = data.email && data.password

  return (
    <div className={styles.wrapper}>
      <AuthHeader />
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.heading}>{i18n.get('auth.login')}</h1>
          <form className={styles.form} onSubmit={onLogin}>
            <InputField
              field="email"
              label={i18n.get('auth.email')}
              value={email}
              onChange={onChange}
              type="email"
              autoComplete="email"
              placeholder={i18n.get('auth.email_placeholder')}
              required={true}
              onError={(error) => {
                error ? setError(i18n.get('auth.invalid_email')) : setError('')
              }}
            />
            <InputField
              field="password"
              label={i18n.get('auth.password')}
              value={password}
              onChange={onChange}
              type="password"
              autoComplete="current-password"
              placeholder={i18n.get('auth.password_placeholder')}
              required={true}
            />
            <div className={styles.checkbox}>
              <input
                checked={staySignedIn}
                onChange={(e) => onChange(e.target.checked, 'staySignedIn')}
                type="checkbox"
              />
              <span>{i18n.get('auth.stay_signed_in')}</span>
            </div>
            <div className={styles.error}>{error}</div>
            <div className={styles.links}>
              <div className={styles.login}>
                <Link href="/signup">{i18n.get('auth.signup')}</Link>
              </div>
              <Link href="/forgot-password">{i18n.get('auth.forgot_password')}</Link>
            </div>
            <button type="submit" disabled={!canLogin} className={styles.action}>
              {i18n.get('auth.login')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
