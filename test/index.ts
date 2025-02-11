import express, { type Request, type Response } from 'express'
import { verifyKeyMiddleware } from "discord-interactions"
import type { APIInteraction } from 'discord-api-types/v10'
import { Cordo } from '../src/core'


await Cordo.mountCordo()

//

const app = express()
app.set('trust proxy', 1)
const clientPublicKey = 'ae92419b8a8752234363888abdc0d2b7bdfc730b4b9182dd6c1d5af594842f12'
const checkKey = verifyKeyMiddleware(clientPublicKey)
app.post('/', (req: Request, res: Response) => {
  checkKey(req, res, () => {
    console.log(req.body)
    const interaction = req.body as APIInteraction
    // interaction._httpCallback = (payload: any) => res.status(200).json(payload)
    Cordo.triggerInteraction(interaction, {
      httpCallback: (payload: any) => res.status(200).json(payload)
    })
  })
})
app.listen(5058, () => console.log('Cordo is running on port 5522'))

