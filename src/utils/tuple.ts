export function tuple<A extends string[]>(...args: A): A {
    return args;
}

export function concatTuples<
    A extends string[],
    B extends string[]
>(tuple1: [...A], tuple2: [...B]): [...A, ...B] {
    return tuple1.concat(tuple2) as any;
}
