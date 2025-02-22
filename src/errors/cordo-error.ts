import * as Ui from "../components"


export class CordoError extends Error {

  constructor(
    public name: string,
    public message: string
  ) {
    super(message)
  }

  public render() {
    return Ui.container(
      Ui.text('Error:', this.name).size('h2'),
      Ui.text(this.message)
    )
  }

}
