import { CordoError } from '../cordo-error'

export class InvalidIdError extends CordoError {

  constructor(message: string) {
    super('InvalidIdError', message)
  }

}
