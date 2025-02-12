import type { APIEmoji } from "discord-api-types/v10"


export namespace LibEmoji {

  export type Input = string | APIEmoji

  export function read(input: Input): APIEmoji {
    if (typeof input !== 'string')
      return input

    if (!input.startsWith('<') || !input.endsWith('>'))
      return { id: null, name: input }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [ _, name, id ] = input.slice(1, -1).split(':')
    return { id, name }
  }

}
