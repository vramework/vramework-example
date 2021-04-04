export class EError extends Error {
  __proto__: Error
  constructor(message?: string) {
    const trueProto = new.target.prototype
    super(message)

    // Alternatively use Object.setPrototypeOf if you have an ES6 environment.
    this.__proto__ = trueProto
  }
}

export class InvalidParametersError extends EError {}
export class NotFoundError extends EError {}
export class InvalidOriginError extends EError {}
export class AccessDeniedError extends EError {}
export class UserMissingSession extends EError {}
export class UserAlreadyExists extends EError {}
export class InvalidRoleError extends EError {}
export class UserNotFoundError extends EError {}
export class InvalidPasswordError extends EError {}
export class MissingPasswordError extends EError {}
export class ResetHashExpiredError extends EError {}
export class HashNotFoundError extends EError {}
export class UploadMaxSizeExceededError extends EError {}
export class UploadCategoryUnknownError extends EError {}
export class MissingAuthFlagError extends EError {}

export const apiErrors = new Map<any, { status: number, message: string }>([
  [InvalidParametersError, { status: 422, message: 'Invalid Parameters'}],
  [NotFoundError, { status: 404, message: 'Not Found'}],
  [InvalidOriginError, { status: 400, message: 'Invalid Origin'}],
  [AccessDeniedError, { status: 401, message: 'Access Denied'}],
  [UserMissingSession, { status: 401, message: 'Missing Session'}],
  [UserAlreadyExists, { status: 401, message: 'User Exists'}],
  [UserNotFoundError, { status: 404, message: 'User Not Found'}],
  [InvalidPasswordError, { status: 401, message: 'Invalid Password'}],
  [ResetHashExpiredError, { status: 401, message: 'Reset Hash Password Expired'}],
  [HashNotFoundError, { status: 401, message: 'Hash Not Found'}],
  [MissingAuthFlagError, { status: 401, message: 'Missing Auth Flag'}],
])
