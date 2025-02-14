import { button, container, divider, image, row, section, selectString, spacer, text } from "../../../src/components"
import { debugRoute } from "../../../src/components/mods/debug-route"
import { defineCordoRoute } from "../../../src/core"
import { goto } from "../../../src/core/funct"


export default defineCordoRoute(() => {

  const games = container(
    section(
      text('F1® Manager 2024 ↗').size('h3').link('https://store.epicgames.com/en-US/p/f1-manager-2024-fe51bd'),
      text('Lead your team to glory in F1® Manager 2024. A new Formula 1® season has arrived, and with it, the most comprehensive F1® management experience to date. Build a legacy with one of 10 official F1® constructors or create your own team for the very first time.'),
    ).decorate(image('https://images-ext-1.discordapp.net/external/hdkp3sj7nLrr9yJN0OUAql1vS97ZDoAMRgldE1u0p_g/https/cdn1.epicgames.com/spt-assets/57015e643399448f8139291daa15bfc2/f1-manager-2024-ky8bk.jpg?format=webp&width=1243&height=699')),
    text(
      '<:steam:1073161237652848670>', '**Epic Games**',
      '﻿ ﻿ ﻿ ﻿',
      '<:keep:1196056221019545692>', '**100% Off**',
      '﻿ ﻿ ﻿ ﻿',
      ':star:', '4.5/5'
    ),
    divider().size('large'),
    section(
      text('Stellar Mess: The Princess Conundrum ↗').size('h3').link('https://store.epicgames.com/en-US/p/f1-manager-2024-fe51bd'),
      text('Stellar Mess is a 2D point&click adventure game, set somewhere in Argentinean Patagonia. The game is inspired by early classic EGA games of the genre.'),
    ).decorate(image('https://images-ext-1.discordapp.net/external/izn8Grpp-zEPPcU-EMOd5qCTxZeExb-CFz_G0EjxAKY/%3Ft%3D1737679003/https/shared.akamai.steamstatic.com/store_item_assets/steam/apps/1507530/header.jpg?format=webp')),
    text(
      '<:steam:1073161249006821406>', '**Steam**',
      '﻿ ﻿ ﻿ ﻿',
      '<:keep:1196056221019545692>', '**100% Off**',
      '﻿ ﻿ ﻿ ﻿',
      ':star:', '4.2/5'
    ),
  )

  return [
    games,
    selectString()
      .addOption({ label: 'For you', value: 'for you', emoji: { id: '1136045901929001031', name: 's' } })
      .addOption({ label: '﻿', description: 'BY TYPE', value: '_2' })
      .addOption({ label: '100% Off (2)', value: 'keep', emoji: { id: '1196056221019545692', name: 's' } })
      .addOption({ label: 'Free Weekend (1)', value: 'timed', emoji: { id: '1196056219610259587', name: 's' } })
      .addOption({ label: 'DLCs & More (1)', value: 'other', emoji: { id: '1196056223326404768', name: 's' } })
      .addOption({ label: '﻿', description: 'BY STORE', value: '_' })
      .addOption({ label: 'Steam (1)', value: 'steam', emoji: { id: '1073161249006821406', name: 's' } })
      .addOption({ label: 'Epic Games (2)', value: 'epic', emoji: { id: '1073161237652848670', name: 's' } })
      .addOption({ label: 'GOG.com (1)', value: 'gog', emoji: { id: '1073161239078916146', name: 's' } })
  ]
})
