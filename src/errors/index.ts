import type { RouteRequest } from "@core/files/route"


export class CordoError extends Error {

}

export class CordoErrorRouteNotFound extends CordoError {

  constructor(public path: string) {
    super(`Route not found: ${path}`)
  }

}

export class CordoErrorRouteAssumptionFailed extends CordoError {

  constructor(public request: RouteRequest, public assumptions: {
    location: RouteRequest['location']
    source: RouteRequest['source']
  }) {
    super(`Route assumption failed: ${JSON.stringify(request)} doesn't match ${JSON.stringify(assumptions)}`)
  }

}
