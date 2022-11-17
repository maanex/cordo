export type OneOrBoth<A, B> = (Partial<A> & B) | (A & Partial<B>);
export type Without<T, U> = {
    [P in Exclude<keyof T, keyof U>]?: never;
};
export type ExactlyOne<T, U> = (T | U) extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;
export type StringNotStartWith<Target, Prefix extends string> = Target extends `${Prefix}${string}` ? never : Target;
export type ListOmit<T, S> = T extends S ? never : T;
