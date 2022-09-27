export function Button({ css = "", ...rest }) {
  return () => (
    <button
      {...rest}
      class={"rounded-md bg-purple-500 text-white px-4 py-2 border border-purple-500 hover:bg-purple-600 active:bg-purple-700 " + css}
    >
      <children />
    </button>
  )
}
