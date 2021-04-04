import { Login } from '@databuilder/dom/src/components/auth/login'
import { loginClientRest } from '@databuilder/api/src/rest/client'

const Page = () => {
  return <Login action={loginClientRest} />
}

export default Page
