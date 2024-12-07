import * as fs from 'fs'
import * as path from 'path'
import Cordo, { SlottedUIState } from '..'
import { InteractionUIState } from '../types/custom'
import { parseParams } from '../lib/utils'


export default class CordoStatesManager {
  
  public static readonly uiStates: Map<string, InteractionUIState> = new Map()
  public static readonly slottedUiStates: Set<SlottedUIState> = new Set()

  //

  public static findUiStates(dir: string | string[], prefix?: string) {
    if (typeof dir !== 'string') dir = path.join(...dir)
    for (const file of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, file)
      let fullName = (prefix ? prefix + '_' : '') + file.split('.')[0]
      while (fullName.endsWith('_')) fullName = fullName.substring(0, fullName.length - 1)

      if (file.includes('.')) {
        if (!file.endsWith('.js') && !(process.versions.bun && file.endsWith('.ts'))) continue
        CordoStatesManager.registerUiState(fullName, require(fullPath).default)
      } else {
        CordoStatesManager.findUiStates(fullPath, fullName)
      }
    }
  }

  public static registerUiState(id: string, state: InteractionUIState) {
    if (CordoStatesManager.uiStates.has(id))
      Cordo._data.logger.warn(`UI State for ${id} already exists. Overriding.`)

    CordoStatesManager.uiStates.set(id, state)

    if (id.includes('$')) {
      const regex = new RegExp('^' + id.replace(/\$[a-zA-Z0-9]+/g, '[a-zA-Z0-9]+') + '$')
      CordoStatesManager.slottedUiStates.add({ id, regex, state })
    }
  }

  public static getStateById(id: string): { state: InteractionUIState, params: Record<string, string> } {
    if (CordoStatesManager.uiStates.has(id)) {
      return {
        state: CordoStatesManager.uiStates.get(id),
        params: {}
      }
    }

    const regexSearchResult = [ ...CordoStatesManager.slottedUiStates.values() ]
      .find(h => h.regex.test(id))

    if (regexSearchResult) {
      return {
        state: regexSearchResult.state,
        params: parseParams(regexSearchResult.id, id)
      }
    }

    return null
  }

}
