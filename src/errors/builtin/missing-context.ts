import { CordoError } from "../cordo-error"


export class MissingContextError extends CordoError {

  constructor(public description: string) {
    super(
      'Missing context',
      description
    )
  }

}
