export function error(type, message, errorTask) {
  return errorTask
    ? console.error(`[setsuna \`${type}\` error]: ${message}`, ...errorTask)
    : console.error(type)
}
