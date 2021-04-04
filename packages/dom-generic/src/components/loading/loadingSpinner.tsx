import * as React from 'react'
import styles from './loading.module.css'

export const LoadingSpinner: React.FunctionComponent<{ color: string; size: number }> = ({ color, size }) => {
  return <div style={{ borderTopColor: color, width: size, height: size }} className={styles.loading} />
}