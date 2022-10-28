export function error(type, message, ...errorTask) {
  return message
    ? console.error(
        `[setsuna-router ${type ? `${type}` : ""} error]: ${message}`,
        ...errorTask
      )
    : console.error(type)
}
