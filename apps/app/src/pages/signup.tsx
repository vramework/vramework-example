import { Signup } from '@databuilder/dom/src/components/auth/signup'
import { useCallback } from 'react'
import { signupClientRest } from '@databuilder/api/src/rest/client'
import { UserSignup } from '@databuilder/types/src/user'
import { useRouter } from 'next/router'

const Page = () => {
  const { query } = useRouter()
  const signup = useCallback(
    async (data: UserSignup) => {
      await signupClientRest({ ...data, authFlag: query.authFlag as string })
    },
    [query],
  )
  return <Signup action={signup} />
}

export default Page
