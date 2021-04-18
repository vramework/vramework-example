import { Config } from '../api'
import {
  S3Client,
  DeleteObjectCommand,
  PutObjectCommand,
  GetObjectCommand,
  GetObjectCommandOutput,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
// TODO: CloudFront does not yet support signing in v3 (https://github.com/aws/aws-sdk-js-v3/issues/1822)
import { CloudFront } from 'aws-sdk'
import { Readable } from 'stream'
import { createWriteStream } from 'fs'
import { v4 as uuid } from 'uuid'
import { Logger, SecretService } from '@vramework/backend-common/src/services'

export class S3File {
  private s3 = new S3Client({ region: 'eu-central-1' })
  private cloudfront!: CloudFront.Signer

  constructor(private config: Config, private logger: Logger) {}

  public async init(secrets: SecretService) {
    const id = await secrets.getSecret('TODO')
    const key = await secrets.getSecret('TODO')
    this.cloudfront = new CloudFront.Signer(id, key)
  }

  public async createFileCopy(Key: string) {
    const res: GetObjectCommandOutput = await this.s3.send(
      new GetObjectCommand({
        Bucket: `content.${this.config.domain}`,
        Key,
      }),
    )
    const inStream = res.Body!
    if (inStream instanceof Readable) {
      return new Promise((resolve) => {
        const destinationFile = `/tmp/${uuid()}`
        const outStream = createWriteStream(destinationFile)
        inStream.pipe(outStream)
        inStream.on('end', () => {
          resolve(destinationFile)
        })
      })
    } else {
      throw new Error('Unknown object stream type.')
    }
  }

  public async uploadBuffer(Key: string, Body: string | Readable | ReadableStream<any> | Blob | Uint8Array | Buffer) {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: `content.${this.config.domain}`,
        Key,
        Body,
      }),
    )
    return `content.${this.config.domain}/${Key}`
  }

  public async signContentURL(key: string) {
    return this.cloudfront.getSignedUrl({
      url: `https://content.${this.config.domain}/${key}`,
      expires: Date.now() + 15 * 60 * 1000,
    })
  }

  public async getUploadURL(Key: string, ContentType: string) {
    const command = new PutObjectCommand({
      Bucket: `content.${this.config.domain}`,
      Key,
      ContentType,
    })
    return {
      uploadUrl: await getSignedUrl(this.s3, command, {
        expiresIn: 3600,
      }),
      assetKey: Key,
    }
  }

  public async delete(Key: string) {
    try {
      this.logger.info(`Deleting file, key: ${Key}`)
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: `content.${this.config.domain}`,
          Key,
        }),
      )
    } catch (e) {
      this.logger.error(`Error deleting file, key: ${Key}`, e)
    }
  }
}
