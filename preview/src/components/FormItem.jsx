export function FormItem({ label }) {
  return () => (
    <div class="formItem flex items-center gap-1 max-w-[280px]">
      { label && <section class="label font-medium text-right w-[80px] flex-shrink-0">{label}</section> }
      <section class="content w-full">
        <children />
      </section>
    </div>
  )
}
