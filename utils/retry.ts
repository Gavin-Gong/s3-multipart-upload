export function retry(promise: () => Promise<any>, times = 3, opts?: {
  onErr?: Function
  onTimeChange?: Function
}): any {
  const { onErr, onTimeChange } = opts ?? {}
  return promise().catch((err: any) => {
    if (times <= 0) {
      onErr?.()
      throw err
    }
    onTimeChange?.(times)
    return retry(promise, times - 1, opts)
  })
}