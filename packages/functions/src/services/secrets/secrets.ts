export interface Secrets {
  getCloudfrontContentKey(): Promise<{ id: string; key: string }>
}
