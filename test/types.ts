declare module "cordo" {
  export type DynamicTypes = {
    Route: `index` | `nested/cool` | `nested/${string}/inner` | `nested/${string}/index` | `nested/${string}`
  }
}
