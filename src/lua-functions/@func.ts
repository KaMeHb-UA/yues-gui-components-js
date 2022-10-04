/**
 * A helper for prettier definition of lua function factories
 */
export function func<T extends any[]>(
    argsNames: string[],
    bodyGetter: (...args: T) => string
): (...args: T) => [string, string[]] {
    return (...args: T) => [
        bodyGetter(...args).trim(),
        argsNames,
    ];
}
