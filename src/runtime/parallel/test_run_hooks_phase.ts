import type {
  FinishedEvent,
  Phase,
  RunAfterAllHooksCommand,
  RunBeforeAllHooksCommand,
} from './types'

export class TestRunHooksPhase
  implements Phase<RunBeforeAllHooksCommand | RunAfterAllHooksCommand>
{
  private failing = false
  private waiting = 0

  constructor(
    private readonly resolve: (success: boolean) => void,
    readonly reject: (reason: unknown) => void,
    private readonly type: 'BEFOREALL_HOOKS' | 'AFTERALL_HOOKS'
  ) {}

  fill(): RunBeforeAllHooksCommand | RunAfterAllHooksCommand {
    this.waiting++
    return {
      type: this.type,
    }
  }

  next(
    _command: RunBeforeAllHooksCommand | RunAfterAllHooksCommand,
    event: FinishedEvent
  ): undefined {
    if (!event.success) {
      this.failing = true
    }
    this.waiting--
    if (this.waiting === 0) {
      this.resolve(!this.failing)
    }
    return undefined
  }
}
