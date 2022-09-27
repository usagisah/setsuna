import { isPlainObject } from "@setsuna/share"

export function resolveModelValue(e) {
  if (e?.target) {
    return e.target.value
  } else if (isPlainObject(e) && "value" in e) {
    return e.value
  } else {
    return e
  }
}
