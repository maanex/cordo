import { container } from '../components/builtin/container'
import { text } from '../components/builtin/text'


export class CordoError extends Error {

  constructor(
    public name: string,
    public message: string
  ) {
    super(message)
  }

  public render() {
    return container(
      text('Error:', this.name).size('h2'),
      text(this.message)
    )
  }

}
