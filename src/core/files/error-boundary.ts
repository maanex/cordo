import { CordoError } from "../../errors"
import type { RouteRequest } from "./route"


const CordoErrorBoundarySymbol = Symbol.for('CordoErrorBoundary')

export type CordoErrorBoundary = {
  [CordoErrorBoundarySymbol]: typeof CordoErrorBoundarySymbol
  handler: CordoErrorHandler
}

export type CordoErrorHandler = (error: CordoError, request: RouteRequest) => any

export function defineCordoErrorBoundary(handler: CordoErrorHandler): CordoErrorBoundary {
  return {
    [CordoErrorBoundarySymbol]: CordoErrorBoundarySymbol,
    handler
  }
}

export namespace ErrorBoundaryInternals {

  export type ParsedBoundary = {
    path: string
    filePath: string
    impl: CordoErrorBoundary
  }

  export async function readHandler(filePath: string): Promise<CordoErrorBoundary | null> {
    const content = await import(filePath)

    if (!content || !content.default)
      return null

    if (!content.default[CordoErrorBoundarySymbol])
      return null

    return content.default
  }

}
