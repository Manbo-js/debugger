declare module 'manbo-debugger' {
  import * as Manbo from 'manbo'
  export default ManboDebugger

  class ManboDebugger {
    constructor(client: Manbo.Client, options: ManboDebuggerOptions)
    public client: Manbo.Client
    public options: ManboDebuggerOptions
    public run(message: Manbo.Message): Promise<any>
  }

  interface ManboDebuggerOptions {
    aliases?: Array<string>
    owners?: Array<string>
    prefix?: string
    secrets?: Array<any>
    globalVariable?: Record<string, any>
    noPerm?: (message: Manbo.Message) => any|Promise<any>
    isOwner?: (user: Manbo.User) => boolean|Promise<boolean>
  }

  export class ProcessManager {
    constructor(message: Manbo.Message, content: string, manboDebugger: ManboDebugger, options: ProcessOptions)
    public target: Manbo.TextChannel
    public manboDebugger: ManboDebugger
    public content: string
    public messageContent: string
    public limit: number
    public splitted: Array<string>
    public page: number
    public author: Manbo.User
    public actions: Array<Action>
    public options: ProcessOptions
  }

  interface ProcessOptions {
    limit?: number
    noCode?: boolean
    secrets?: Array<any>
    lang?: string
  }

  interface Action {
    emoji: string
    requirePage: boolean
    action({ manager: ManboDebugger, ...args }): any | Promise<any>
  }
}
