export function callEffectLoader(record) {
  record.matchs.forEach(async ({ loader, loaderData }) => {
    if (!loader) {
      return
    }

    loaderData.value = Promise.resolve(loader()).catch(err => {
      console.error("router loader error: ", err)
    })
  })
}
