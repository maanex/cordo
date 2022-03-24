export declare type OneOrBoth<A, B> = (Partial<A> & B) | (A & Partial<B>);
export declare type Without<T, U> = {
    [P in Exclude<keyof T, keyof U>]?: never;
};
export declare type ExactlyOne<T, U> = (T | U) extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;
export declare type StringNotStartWith<Target, Prefix extends string> = Target extends `${Prefix}${string}` ? never : Target;
