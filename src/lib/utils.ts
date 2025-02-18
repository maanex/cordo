

export namespace LibUtils {

  export function* iterate(...args: any[][]) {
    for (const arg of args) {
      for (const entry of arg)
        yield entry
    }
  }

}
