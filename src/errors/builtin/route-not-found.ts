import { CordoError } from "../cordo-error"


export class RouteNotFoundError extends CordoError {

  constructor(public path: string) {
    super(
      'Route not found',
      `Cannot navigate to '${path}'`
    )
  }

}
