

const CordoRoute = Symbol('CordoRoute')

export type CordoRoute = {}

export function defineCordoRoute(conf: Partial<CordoRoute> = {}) {
  return { ...conf, [CordoRoute]: CordoRoute }
}

export namespace RouteInternals {

  export type ParsedRoute = {
    name: string | null
    path: string
    impl: CordoRoute
  }

  export async function readRoute(filePath: string): Promise<CordoRoute | null> {
    const content = await import(filePath)

    if (!content || !content.default)
      return null

    if (!content.default[CordoRoute])
      return null

    return content
  }

}
