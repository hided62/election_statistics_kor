export type Nullable<T> = T | null | undefined | '';

export function subsNull<T>(data: Nullable<T>, nullData: T): T {
    if (data === null || data === '' || data === undefined) {
        return nullData;
    }
    return data;
}