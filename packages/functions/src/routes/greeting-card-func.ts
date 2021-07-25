
// Creating this file and running the generateRoutes will automatically add this API endpoint to
// express or/and serverless.
import { APIFunction, APIPermission, APIRoutes } from "../api"
import { UserNotFoundError } from "../errors"
import * as DB from '../../generated/db-types'

export interface SendGreetingCard {
  toUserId: string,
  emailText: string
}

export interface SendGreetingCardResult {
  message: string
}

const sendGreetingCard: APIFunction<SendGreetingCard, SendGreetingCardResult> =
  async (services, { toUserId, emailText }, { userId }) => {
    // This line can be any database driver
    const [fromUser, toUser] = await Promise.all([
      services.database.crudGet<DB.User>('user', ['email'], { userId }, new UserNotFoundError()),
      services.database.crudGet<DB.User>('user', ['email'], { userId: toUserId }, new UserNotFoundError())
    ])

    // Assuming you have en email service hooked up!
    await services.email.sendEmail({
      template: 'getting',
      from: fromUser.email,
      to: toUser.email,
      body: emailText
    })

    return {
      message: 'Email sent!'
    }
  }

const isBelowEmailLimit: APIPermission<SendGreetingCard> = async (services, data, session) => {
  const { emailsSent } = await services.database.crudGet<DB.User>('user', ['emailsSent'], { userId: session.userId }, new UserNotFoundError())
  return emailsSent <= 100
}

const isPaidMember: APIPermission<SendGreetingCard> = async (services, data, session) => {
  return session.isPaidMember
}

export const routes: APIRoutes = [{
  // The TYPE of HTTP Message
  type: 'post',
  // The HTTP Route (supports query and path params)
  route: 'v1/send-greeting-card',
  // The function to execute
  func: sendGreetingCard,
  // The JSON schema to generate from typescript and validate against
  schema: 'SendGreetingCard',
  // A set of permissions to check against, at least one has to be valid
  permissions: {
    // Either a collection of permissions to be anded
    canSendCard: [isBelowEmailLimit],
    // Or a single one
    isPaidMember
  }
}]