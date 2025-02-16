import type { APIEmoji } from "discord-api-types/v10"


export namespace LibEmoji {

  type PartialEmoji = { name: string, id: any } | { id: string, name: any }

  export type Input = string | APIEmoji | PartialEmoji | { object: PartialEmoji }

  export function read(input: Input): APIEmoji {
    if (typeof input === 'string') {
      if (!input.startsWith('<') || !input.endsWith('>'))
        return { id: null, name: input }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [ _, name, id ] = input.slice(1, -1).split(':')
      return { id, name }
    } else {
      if ('object' in input)
        input = input.object
      return {
        id: input.id ?? null,
        name: input.name ?? null
      }
    }
  }

}
