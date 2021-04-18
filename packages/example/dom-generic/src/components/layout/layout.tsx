import * as React from 'react'
import { Footer } from './footer'
import { Header } from './header'

export const Layout: React.FunctionComponent = ({
  children,
}) => {
  return (
    <div>
      <Header />
      <main>
        <div>
          <div>{children}</div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
