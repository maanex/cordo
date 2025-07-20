import { verifyKey } from "discord-interactions"
import { Hono } from "hono"
import { Cordo } from "../core"


export function useWithHono(clientPublicKey: string) {
  if (!clientPublicKey)
    throw new Error('You must specify a Discord client public key');

  const app = new Hono()

  app.post('/', async (c) => {
    const signature = c.req.header('x-signature-ed25519')
    const timestamp = c.req.header('x-signature-timestamp')
    // @ts-ignore
    const bodyStream = c.req.raw.body
    if (!signature || !timestamp || !bodyStream)
      return c.text('Bad Request', 400)

    const body = await Bun.readableStreamToArrayBuffer(bodyStream)
    const isValid = verifyKey(body, signature, timestamp, clientPublicKey)
    if (!isValid)
      return c.text('Bad Request', 401)

    const parsedBody = JSON.parse(Buffer.from(body).toString('utf-8'))
    const { promise, resolve } = Promise.withResolvers<any>()
    Cordo.triggerInteraction(parsedBody, {
      httpCallback: (payload: any) => resolve(payload),
    })

    return c.json(await promise, 200)
  })

  return app
}
