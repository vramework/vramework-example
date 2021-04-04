import { v4 as uuid } from 'uuid'
import { APIFunction, APIRoute } from '../api'
import { Routes } from '@databuilder/types/src/routes'
import { UploadMaxSizeExceededError, UploadCategoryUnknownError } from '../errors'
import { ImageUpload, ImageUploadResponse } from '@databuilder/types/src/upload'

const MAX_SIZE = Infinity

const uploadImage: APIFunction<ImageUpload, ImageUploadResponse> = async (services, { data }) => {
  const { entityType, contentType, size } = data

  let name = data.name
  if (name === 'uuid') {
    name = uuid()
  }

  if (size > MAX_SIZE) {
    throw new UploadMaxSizeExceededError()
  }

  let Key

  if (entityType === 'house' || entityType === 'client' || entityType === 'family') {
    Key = `family/${data.familyId}/${name}.${contentType.split('/')[1]}`
  } else if (entityType === 'caregiver') {
    Key = `caregiver/${data.id}/${name}.${contentType.split('/')[1]}`
  } else {
    throw new UploadCategoryUnknownError()
  }

  return await services.files.getUploadURL(Key, contentType)
}

export const uploadImageRoute: APIRoute<ImageUpload, ImageUploadResponse> = {
  type: 'post',
  route: Routes.UPLOAD_SIGN_IMAGE,
  func: uploadImage,
  schema: 'ImageUpload',
}
