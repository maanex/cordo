import { ButtonStyle } from "discord-api-types/v10"
import { ComponentType, createComponent } from "../component"


export function skuButton(skuId: string) {
  const out = {
    ...createComponent('Button', () => ({
      type: ComponentType.Button,
      style: ButtonStyle.Premium,
      sku_id: skuId
    })),
  }

  return out
}
