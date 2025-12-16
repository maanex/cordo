import { createModifier } from "../modifier"


export function enforcePrivateResponse() {
  return createModifier({
    name: 'enforce-private-response',
    hooks: {
      beforeRouteResponse: (_res, _i, opts) => {
        opts.isPrivate = true
      }
    }
  })
}
