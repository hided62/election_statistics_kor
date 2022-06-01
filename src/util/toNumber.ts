export function toNumber(value: number|string): number{
    if (typeof value === 'number') {
        return value;
    }
    if (typeof value === 'string') {
        return Number(value);
    }
    throw new Error(`Cannot convert ${value} to number`);
}