export interface MongoError extends Error {
  code?: number
  message: string
  keyValue?: Record<string, any>
}

export const uniqueMessage = (error: MongoError): string => {
  let output: string
  try {
    let fieldName = error.message.substring(
      error.message.lastIndexOf('{') + 2,
      error.message.lastIndexOf(':')
    )
    output =
      fieldName.charAt(0).toUpperCase() + fieldName.slice(1) + ' already exists'
  } catch (ex) {
    output = 'Unique field already exists'
  }

  return output
}

export const errorHandler = (error: MongoError): string => {
  let message = ''

  if (error.code) {
    switch (error.code) {
      case 11000:
      case 11001:
        message = uniqueMessage(error)
        break
      default:
        message = 'Some thing went wrong'
    }
  } else {
    message = error.message
  }

  return message
}
