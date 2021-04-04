import Link from 'next/link'
import * as React from 'react'

interface DashboardEntry {
  title: string
  subTitle: string
  link: string
  icon?: string
}
export const Dashboard: React.FunctionComponent<{ nav: DashboardEntry[] }> = ({ nav }) => {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', maxWidth: '40rem', margin: 'auto' }}>
      {nav.map(({ title, subTitle, link }) => {
        return (
          <Link key={title} href={link}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                margin: '1rem',
                padding: '1rem',
                height: '14rem',
                width: '9rem',
                boxShadow: 'var(--layout-box-shadow)',
              }}
            >
              <h4>{title}</h4>
              <div>{subTitle}</div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
