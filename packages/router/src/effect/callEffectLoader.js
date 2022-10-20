import { error } from "../handler"

export function callEffectLoader(record) {
  record.matchs.forEach(async ({ loader, loaderData }) => {
    if (!loader) {
      return
    }

    loaderData.value = Promise.resolve(loader()).catch(err => {
      error("loader", "loader call uncaught exceptions", err)
    })
  })
}
