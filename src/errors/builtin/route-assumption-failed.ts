import type { RouteRequest } from "../../core"
import { CordoError } from "../cordo-error"


export class RouteAssumptionFailedError extends CordoError {

  constructor(
    public request: RouteRequest,
    public assumptions: {
      location: RouteRequest['location']
      source: RouteRequest['source']
    }
  ) {
    super(
      'Route assumption failed',
      `${JSON.stringify(request)} doesn't match ${JSON.stringify(assumptions)}`
    )
  }

}
