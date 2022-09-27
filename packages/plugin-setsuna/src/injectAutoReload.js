export function injectAutoReload({
  result,
  hasRender,
  hasDefineElement,
  hmrComponent
}) {
  if (hasRender) return
  if (hasDefineElement || (hmrComponent && hmrComponent.length > 0)) {
    result.code += `\nimport.meta.hot.accept(mods => {
      if (!mods) return;
      for (const key in mods) {
        const app = mods[key]
        __SETSUNA_HMR_MAP__.invokeReload(app._hmrId, app)
      }
    })`
  }
}
