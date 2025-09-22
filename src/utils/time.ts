type CallbackFunction<T = any> = (...args: any[]) => Promise<T>

interface PerformanceResult<T> {
  time: string
  timeMs: number
  response: T
  success: boolean
}

export const measureTime = async <T>(
  callback: CallbackFunction<T>,
  label?: string
): Promise<PerformanceResult<T>> => {
  const start = performance.now()

  try {
    const response = await callback()
    const end = performance.now()
    const elapsed = end - start

    const result = {
      time: `${elapsed.toFixed(2)}ms`,
      timeMs: elapsed,
      response,
      success: true
    }

    if (label) {
      console.log(`⏱️ ${label}: ${result.time}`)
    }

    return result
  } catch (error) {
    const end = performance.now()
    const elapsed = end - start

    console.error(
      `Error during ${label || 'execution'} (${elapsed.toFixed(2)}ms):`,
      error
    )

    throw {
      time: `${elapsed.toFixed(2)}ms`,
      timeMs: elapsed,
      error,
      success: false
    }
  }
}

export const timeIt = async <T>(callback: CallbackFunction<T>): Promise<T> => {
  const result = await measureTime(callback)
  return result.response
}

export const measureAndLog = async <T>(
  callback: CallbackFunction<T>,
  label: string
): Promise<T> => {
  const result = await measureTime(callback, label)
  return result.response
}
