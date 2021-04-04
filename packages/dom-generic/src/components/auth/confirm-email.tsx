import * as React from 'react'
import { FunctionComponent } from 'react'
import styles from './auth.module.css'
import { useRouter } from 'next/router'
import { AuthHeader } from './auth-header'
import { useI18n } from '@databuilder/api/src/contexts/i18n'
import { confirmEmailRest } from '@databuilder/api/src/rest/user'
import useAsyncEffect from 'use-async-effect'

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

export const ConfirmEmail: FunctionComponent = () => {
  const i18n = useI18n()
  const router = useRouter()
  const { hash } = router.query as { hash: string }
  const [confirmed, setConfirmed] = React.useState(false)
  const [invalidMessage, setInvalidMessage] = React.useState<string | null>()

  const invalidMessages = {
    missing: i18n.get('auth.missing_confirmation_hash'),
    expired: i18n.get('auth.invalid_confirmation_hash'),
    invalid: i18n.get('auth.invalid_confirmation_hash'),
  }

  React.useEffect(() => {
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
    setInvalidMessage(invalidMessage)
  }, [hash])

  useAsyncEffect(
    async (isMounted) => {
      if (hash) {
        try {
          await confirmEmailRest(hash)
          if (isMounted()) {
            setConfirmed(true)
          }
        } catch (e) {
          setInvalidMessage(invalidMessages.invalid)
        }
      }
    },
    [hash],
  )

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <AuthHeader />
        {confirmed ? i18n.get('auth.email_confirmed') : i18n.get('auth.email_confirmation_error')}
        {invalidMessage}
      </div>
    </div>
  )
}
