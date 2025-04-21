import express from 'express'
import { Cordo } from '../src/core'
import { useWithExpress } from '../src/plugin'


await Cordo.mountCordo()

//

const app = express()
app.set('trust proxy', 1)
const clientPublicKey = 'ae92419b8a8752234363888abdc0d2b7bdfc730b4b9182dd6c1d5af594842f12'
app.use(useWithExpress(clientPublicKey))
app.listen(5058, () => console.log('Cordo is running on port 5522'))

/* OR WITH HONO

const app = new Hono()
app.use('/cordo', useWithHono(clientPublicKey))
return app
*/

/* OR WITH DISCORD.JS

const client = new Client({ ... })
useWithDiscordJs(client)
client.login()
*/
