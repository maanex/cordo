import { CordoError } from '../cordo-error'

export class PluginConfigurationError extends CordoError {

  constructor(message: string) {
    super('PluginConfigurationError', message)
  }

}
