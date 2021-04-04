import * as React from 'react'
import { SessionHOC } from '@databuilder/dom/src/components/auth/hoc-session'
import { Layout } from '@databuilder/dom/src/components/layout/layout'

const Page: React.FunctionComponent = () => {
  return (
    <SessionHOC>
      <Layout>
      </Layout>
    </SessionHOC>
  )
}

export default Page
