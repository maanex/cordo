import { CordoError } from '../cordo-error'

export class NotMountedError extends CordoError {

  constructor(message: string = 'Cordo is not mounted') {
    super('NotMountedError', message)
  }

}
