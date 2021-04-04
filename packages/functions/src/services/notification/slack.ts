import fetch from 'node-fetch'
import { Config } from '../../api'

export class Slack {
  private errorChannel: string | null

  constructor (private config: Config) {
    this.errorChannel = this.config.slack.hooks.error
    
  }

  public async notify(text: string) {
    if (this.errorChannel) {
      await fetch(this.errorChannel, {
        method: 'post',
        body: JSON.stringify({ text }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }
      
  }
}
