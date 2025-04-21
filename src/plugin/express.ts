import { verifyKeyMiddleware } from "discord-interactions"
import { Cordo } from '@core'


type ExpressRequest = {
  headers: NodeJS.Dict<string | string[]>
  body: any
}
type ExpressResponse = {
  status: (code: number) => any
  end: () => any
  json: (data: any) => any
}

export function useWithExpress(clientPublicKey: string) {
  if (!clientPublicKey)
    throw new Error('You must specify a Discord client public key');

  const checkKey = verifyKeyMiddleware(clientPublicKey)

  return (req: ExpressRequest, res: ExpressResponse) => {
    checkKey(req as any, res as any, () => {
      Cordo.triggerInteraction(req.body, {
        httpCallback: (payload: any) => res.status(200).json(payload)
      })
    })
  }
}
