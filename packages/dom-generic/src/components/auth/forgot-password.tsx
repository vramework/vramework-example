import { useChangedData } from '@databuilder/api/src/hooks/changes'
import * as React from 'react'
import { FunctionComponent, useCallback, useRef, useState } from 'react'
import { InputField } from '../field/input-field'
import styles from './auth.module.css'
import { AuthHeader } from './auth-header'
import Link from 'next/link'
import { useI18n } from '@databuilder/api/src/contexts/i18n'
import { forgotPasswordRest } from '@databuilder/api/src/rest/user'

export const ForgotPassword: FunctionComponent = () => {
  const i18n = useI18n()

  const original = useRef({ email: '' })
  const { data, onChange } = useChangedData(original.current)
  const { email } = data
  const [completed, setCompleted] = useState<boolean>(false)

  const [error, setError] = useState<string>()

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      try {
        await forgotPasswordRest({ email })
        setCompleted(true)
      } catch (e) {
        setError(i18n.get('auth.error_resetting_password'))
      }
    },
    [data],
  )

  const canSignup = Object.values(data).every((v) => !!v)

  return (
    <div className={styles.wrapper}>
      <AuthHeader />
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.heading}>{i18n.get('auth.reset_password')}</h1>
          {!completed && (
            <form className={styles.form} onSubmit={onSubmit}>
              <InputField
                label={i18n.get('auth.email')}
                field="email"
                value={email}
                onChange={onChange}
                type="email"
                autoComplete="email"
                placeholder={i18n.get('auth.email_placeholder')}
                onError={(error) => {
                  error ? setError(i18n.get('auth.invalid_email')) : setError('')
                }}
              />
              <div className={styles.error}>{error}</div>
              <div className={styles.links}>
                <Link href="/login">{i18n.get('auth.back')}</Link>
              </div>
              <button type="submit" disabled={!canSignup} className={styles.action}>
                {i18n.get('auth.submit_forgot_password')}
              </button>
            </form>
          )}
          {completed && <div>{i18n.get('auth.reset_completed')}</div>}
        </div>
      </div>
    </div>
  )
}
