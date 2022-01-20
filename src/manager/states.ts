import * as fs from 'fs'
import * as path from 'path'
import Cordo from '..'
import { InteractionUIState } from '../types/custom'


export default class CordoStatesManager {
  
  public static readonly uiStates: Map<string, InteractionUIState> = new Map()

  //

  public static findUiStates(dir: string | string[], prefix?: string) {
    if (typeof dir !== 'string') dir = path.join(...dir)
    for (const file of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, file)
      let fullName = (prefix ? prefix + '_' : '') + file.split('.')[0]
      while (fullName.endsWith('_')) fullName = fullName.substring(0, fullName.length - 1)

      if (file.includes('.')) {
        if (!file.endsWith('.js')) continue
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
  }

}
