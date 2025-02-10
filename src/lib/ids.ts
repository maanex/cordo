

export namespace LibIds {

  const bitSet = [
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
    'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
    'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D',
    'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N',
    'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
    'Y', 'Z', '-', '_'
  ]
  const size = 6
  const bitMap = 0b111111
  const maxId = (1<<31 - 1) * 2 - 1

  export function stringify(id: number, length: number) {
    if (id > maxId) throw new Error(`Id ${id} is larger than 31 bits`)
    let out = ''
    for (let i = 0; i < length; i++)
      out += bitSet[(id >> (size*i)) & bitMap]
    return out
  }

}
