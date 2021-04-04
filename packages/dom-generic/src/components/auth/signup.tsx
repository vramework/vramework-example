import React, { useState } from 'react'
import Link from 'next/link'
import { useChangedData } from '@databuilder/api/src/hooks/changes'
import { FunctionComponent, useCallback, useRef } from 'react'
import { InputField } from '../field/input-field'
import { UserSignup } from '@databuilder/types/src/user'
import { AuthHeader } from './auth-header'
import styles from './auth.module.css'
import { useI18n } from '@databuilder/api/src/contexts/i18n'
import { validatePassword } from '@databuilder/api/src/utils/password-check'

type signupUser = (data: UserSignup) => Promise<void>

export const Signup: FunctionComponent<{ action: signupUser }> = ({ action }) => {
  const i18n = useI18n()

  const [error, setError] = useState<string>()
  const original = useRef({
    email: '',
    password: '',
    confirmPassword: '',
    firstname: '',
    lastname: '',
    legalCheck: false,
  })
  const { data, onChange } = useChangedData(original.current)
  const { email, password, confirmPassword, firstname, lastname, legalCheck } = data

  const onSignup = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      try {
        await action({ email, password, firstname, lastname })
      } catch (e) {
        setError(i18n.get('auth.signup_error'))
      }
    },
    [data],
  )

  const onContinue = useCallback(() => {
    const passwordValid = validatePassword(password)
    if (!passwordValid) {
      setError(i18n.get('auth.invalid_password'))
      return
    }

    if (password !== confirmPassword) {
      setError(i18n.get('auth.error_password_not_maching'))
      return
    }

    setError('')
    setCardState('name')
  }, [data])

  const canContinue = data.email && data.password && data.confirmPassword
  const canSignup = Object.values(data).every((v) => !!v) && error === ''
  const [cardState, setCardState] = useState<string>('email')

  const EmailForm = (
    <>
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
        autoComplete="new-password"
        placeholder={i18n.get('auth.password_placeholder')}
        required={true}
      />
      <InputField
        field="confirmPassword"
        label={i18n.get('auth.confirm_password')}
        value={confirmPassword}
        onChange={onChange}
        type="password"
        autoComplete="confirm-password"
        placeholder={i18n.get('auth.confirm_password_placeholder')}
        required={true}
      />
      <div className={styles.error}>{error}</div>
      <div className={styles.login}>
        <Link href="/login">{i18n.get('auth.login')}</Link>
      </div>
      <button type="button" disabled={!canContinue} className={styles.action} onClick={onContinue}>
        {i18n.get('auth.continue')}
      </button>
    </>
  )

  const NameForm = (
    <>
      <InputField
        field="firstname"
        label={i18n.get('auth.firstname')}
        value={firstname}
        onChange={onChange}
        type="text"
        autoComplete="firstname"
        placeholder={i18n.get('auth.firstname_placeholder')}
        required={true}
        onError={(error) => {
          error ? setError(i18n.get('auth.invalid_name')) : setError('')
        }}
      />
      <InputField
        field="lastname"
        label={i18n.get('auth.lastname')}
        value={lastname}
        onChange={onChange}
        type="text"
        autoComplete="lastname"
        placeholder={i18n.get('auth.lastname_placeholder')}
        required={true}
        onError={(error) => {
          error ? setError(i18n.get('auth.invalid_name')) : setError('')
        }}
      />
      <div className={styles.checkbox}>
        <input checked={legalCheck} onChange={(e) => onChange(e.target.checked, 'legalCheck')} type="checkbox" />
        <span>
          {i18n.get('auth.terms_and_conditions_prefix')}{' '}
          <a target="__blank" style={{ marginLeft: 0 }} href="https://www.databuilder.app/terms-and-conditions">
            {i18n.get('auth.terms_and_conditions')}
          </a>
        </span>
      </div>
      <div className={styles.checkbox}>
        <input onChange={(e) => onChange(e.target.checked, 'staySignedIn')} type="checkbox" />
        <span>{i18n.get('auth.stay_signed_in')}</span>
      </div>
      <div className={styles.error}>{error}</div>
      <div className={styles.links}>
        <div className={styles.login}>
          <Link href="/login">{i18n.get('auth.login')}</Link>
        </div>
        <span onClick={() => setCardState('email')}>{i18n.get('auth.back')}</span>
      </div>
      <button type="submit" disabled={!canSignup} className={styles.action}>
        {i18n.get('auth.signup_button')}
      </button>
    </>
  )

  return (
    <div className={styles.wrapper}>
      <AuthHeader />
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.heading}>{i18n.get('auth.signup')}</h1>
          <form className={styles.form} onSubmit={onSignup}>
            {cardState === 'email' ? EmailForm : NameForm}
          </form>
        </div>
      </div>
    </div>
  )
}
