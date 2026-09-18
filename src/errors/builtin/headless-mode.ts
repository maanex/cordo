import { CordoError } from '../cordo-error'

export class HeadlessModeError extends CordoError {

  constructor(message: string = 'Cordo is mounted in headless mode and cannot perform this action') {
    super('HeadlessModeError', message)
  }

}
