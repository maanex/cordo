import type { Permissions } from 'discord-api-types/globals'
import { ChannelType, ApplicationCommandOptionType, ApplicationCommandType, type APIApplicationCommandOption } from 'discord-api-types/v10'
import type { LocalizedString } from '../../lib/localization'
import { CordoGateway } from '../gateway'
import { RoutingResolve } from '../routing/resolve'
import { CordoMagic } from '../magic'
import type { CordoInteraction } from '../interaction'
import type { CordoRoute } from './route'


type CommandOption = {
  name: string | LocalizedString
  description: string | LocalizedString
  required?: boolean
} & ({
  type: 'string'
  minLength?: number
  maxLength?: number
  choices: Array<{
    name: string | LocalizedString
    value: string
  }>
} | {
  type: 'integer'
  minValue?: number
  maxValue?: number
  autocomplete?: boolean
  choices?: Array<{
    name: string | LocalizedString
    value: number
  }>
} | {
  type: 'boolean'
} | {
  type: 'user'
} | {
  type: 'channel'
  channelTypes?: ChannelType[]
} | {
  type: 'role'
} | {
  type: 'mentionable'
} | {
  type: 'number'
  minValue?: number
  maxValue?: number
  autocomplete?: boolean
  choices: Array<{
    name: string | LocalizedString
    value: number
  }>
} | {
  type: 'attachment'
  fileTypes?: Array<'image' | 'video' | 'audio' | `.${string}`>
})

const CordoCommandSymbol = Symbol.for('CordoCommand')

type CommandInput = {
  type: 'chat' | 'message' | 'user' | 'entrypoint'
  name?: string | LocalizedString
  description?: string | LocalizedString
  defaultMemberPermissions?: Permissions
  nsfw?: boolean
  limitInstallTypes?: Array<'guild' | 'user'>
  limitContexts?: Array<'guild' | 'dm' | 'group'>
  options?: CommandOption[]
  route: CordoRoute | 'launch_activity'
  private?: boolean | ((r: CordoInteraction) => boolean)
}

export type CordoCommand = {
  [CordoCommandSymbol]: typeof CordoCommandSymbol
} & CommandInput

export function defineCordoCommand(command: CommandInput): CordoCommand {
  return {
    [CordoCommandSymbol]: CordoCommandSymbol,
    ...command
  }
}

export namespace CommandInternals {
  export async function readCommand(filePath: string): Promise<CordoCommand | null> {
    const content = await import(filePath)

    if (!content || !content.default)
      return null

    if (!content.default[CordoCommandSymbol])
      return null

    return content.default
  }

  const optionTypeMap: Record<string, ApplicationCommandOptionType> = {
    string: ApplicationCommandOptionType.String,
    integer: ApplicationCommandOptionType.Integer,
    boolean: ApplicationCommandOptionType.Boolean,
    user: ApplicationCommandOptionType.User,
    channel: ApplicationCommandOptionType.Channel,
    role: ApplicationCommandOptionType.Role,
    mentionable: ApplicationCommandOptionType.Mentionable,
    number: ApplicationCommandOptionType.Number,
    attachment: ApplicationCommandOptionType.Attachment
  }

  const commandTypeMap: Record<string, ApplicationCommandType> = {
    chat: ApplicationCommandType.ChatInput,
    user: ApplicationCommandType.User,
    message: ApplicationCommandType.Message,
    entrypoint: 4 // ApplicationCommandType.PrimaryEntryPoint
  }

  function resolveLocalizedText(input: string | LocalizedString | undefined, fallback: string = ''): { value: string, localizations: Record<string, string> | undefined } {
    if (typeof input === 'string') {
      return { value: input, localizations: undefined }
    } else if (input && typeof input === 'object') {
      const localizations = { ...input }
      delete (localizations as any).default
      return { value: input.default, localizations }
    }
    return { value: fallback, localizations: undefined }
  }

  function mapCommandOptionToApiOption(opt: any): APIApplicationCommandOption {
    const { value: name, localizations: name_localizations } = resolveLocalizedText(opt.name)
    const { value: description, localizations: description_localizations } = resolveLocalizedText(opt.description)

    const res: any = {
      type: optionTypeMap[opt.type] || ApplicationCommandOptionType.String,
      name,
      name_localizations,
      description,
      description_localizations,
      required: opt.required,
      autocomplete: opt.autocomplete,
      min_value: opt.minValue,
      max_value: opt.maxValue,
      min_length: opt.minLength,
      max_length: opt.maxLength,
      file_types: opt.fileTypes,
      channel_types: opt.channelTypes,
      choices: opt.choices?.map((c: any) => {
        const { value: name, localizations: name_localizations } = resolveLocalizedText(c.name)
        return { name, name_localizations, value: c.value }
      })
    }

    return res
  }

  interface CommandTree {
    command?: CordoCommand
    subcommands: Map<string, CommandTree>
  }

  function buildApiOption(rawName: string, tree: CommandTree): APIApplicationCommandOption {
    const { value: name, localizations: name_localizations } = resolveLocalizedText(tree.command?.name, rawName)
    const { value: description, localizations: description_localizations } = resolveLocalizedText(tree.command?.description, 'No description provided')

    const isGroup = tree.subcommands.size > 0

    const options: any[] = []
    if (isGroup) {
      for (const [ subName, subTree ] of tree.subcommands.entries()) 
        options.push(buildApiOption(subName, subTree))
    } else if (tree.command?.options) {
      options.push(...tree.command.options.map(mapCommandOptionToApiOption))
    }

    return {
      type: isGroup
        ? ApplicationCommandOptionType.SubcommandGroup
        : ApplicationCommandOptionType.Subcommand,
      name,
      name_localizations,
      description,
      description_localizations,
      options: options.length > 0 ? options : undefined
    } as any
  }

  export async function syncCommands(commands: Map<string, CordoCommand> | undefined, guild?: string, options?: { maxRetries?: number }) {
    if (!commands || commands.size === 0) {
      console.warn('No commands to sync. Is cordo initialized and commands defined?')
      return
    }
    
    const rootCommands = new Map<string, CommandTree>()

    const config = CordoMagic.getConfig()
    const prefix = (config?.defaults?.commandRoutePrefix ?? 'command') + '/'

    for (const [ route, command ] of commands.entries()) {
      let cleanRoute = route
      if (cleanRoute.startsWith(prefix))
        cleanRoute = cleanRoute.slice(prefix.length)
      cleanRoute = cleanRoute.replace(/\.\w+$/, '')

      const parts = cleanRoute.split('/')
      let currentLevel = rootCommands

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i]
        if (!currentLevel.has(part)) 
          currentLevel.set(part, { subcommands: new Map() })

        const node = currentLevel.get(part)!
        if (i === parts.length - 1) 
          node.command = command

        currentLevel = node.subcommands
      }
    }

    const apiCommands: any[] = []

    for (const [ rootName, tree ] of rootCommands.entries()) {
      let { value: name, localizations: nameLocalizations } = resolveLocalizedText(tree.command?.name, rootName)

      if (tree.command) {
        const commandTypeStr = tree.command.type === 'chat' ? 'slash' : tree.command.type
        if (commandTypeStr === 'slash' || commandTypeStr === 'message' || commandTypeStr === 'user') {
          const expectedRoute = RoutingResolve.getRouteForCommand(name, commandTypeStr as any).path.split('/').pop()
          if (expectedRoute !== rootName) {
            console.error(`Command name '${name}' resolves to route '${expectedRoute}' which does not match actual route '${rootName}'. Using route name instead.`)
            name = rootName
            nameLocalizations = undefined
          }
        }
      }

      const { value: description, localizations: descriptionLocalizations } = resolveLocalizedText(
        tree.command?.description, 
        tree.subcommands.size > 0 ? 'Command group' : 'No description provided'
      )

      const cmdType = tree.command ? (commandTypeMap[tree.command.type] || ApplicationCommandType.ChatInput) : ApplicationCommandType.ChatInput

      const apiOptions: any[] = []
      if (tree.subcommands.size > 0) {
        for (const [ subName, subTree ] of tree.subcommands.entries()) 
          apiOptions.push(buildApiOption(subName, subTree))
        
      } else if (tree.command?.options) {
        apiOptions.push(...tree.command.options.map(mapCommandOptionToApiOption))
      }

      const apiCmd: any = {
        name,
        name_localizations: nameLocalizations,
        type: cmdType,
        options: apiOptions.length > 0 ? apiOptions : undefined
      }

      if (cmdType === ApplicationCommandType.ChatInput) {
        apiCmd.description = description
        apiCmd.description_localizations = descriptionLocalizations
      }

      if (tree.command) {
        apiCmd.default_member_permissions = tree.command.defaultMemberPermissions?.toString()
        apiCmd.nsfw = tree.command.nsfw
        apiCmd.contexts = tree.command.limitContexts ? tree.command.limitContexts.map(c => c === 'guild' ? 0 : c === 'dm' ? 1 : 2) : undefined
        apiCmd.integration_types = tree.command.limitInstallTypes ? tree.command.limitInstallTypes.map(i => i === 'guild' ? 0 : 1) : undefined
      }

      apiCommands.push(apiCmd)
    }

    const maxRetries = options?.maxRetries ?? 3

    for (const apiCmd of apiCommands.values()) {
      let retries = 0

      while (true) {
        const res = await CordoGateway.upsertCommand(apiCmd, guild)

        if (res.status === 429) {
          const retryAfter = res.headers['retry-after'] || res.data?.retry_after
          const waitTime = retryAfter ? parseFloat(retryAfter) * 1000 : 5000
          console.warn(`Rate limited (429) when syncing command '${apiCmd.name}'. Waiting ${waitTime}ms...`)
          await new Promise(resolve => setTimeout(resolve, waitTime))
          continue
        }

        if (res.status >= 400) {
          console.error(`Error syncing command '${apiCmd.name}' [HTTP ${res.status}]: ${JSON.stringify(res.data)}`)
          if (retries < maxRetries) {
            retries++
            const backoffTime = 1000 * retries
            console.log(`Retrying (${retries}/${maxRetries}) in ${backoffTime}ms...`)
            await new Promise(resolve => setTimeout(resolve, backoffTime))
            continue
          } else {
            console.error(`Max retries reached for command '${apiCmd.name}'. Skipping.`)
            break
          }
        }

        const remaining = res.headers['x-ratelimit-remaining']
        const resetAfter = res.headers['x-ratelimit-reset-after']
        if (remaining !== undefined && parseInt(remaining, 10) === 0 && resetAfter) {
          const waitTime = parseFloat(resetAfter) * 1000
          console.log(`Rate limit bucket depleted. Waiting ${waitTime}ms before next command...`)
          await new Promise(resolve => setTimeout(resolve, waitTime))
        }

        break
      }
    }
  }
}
