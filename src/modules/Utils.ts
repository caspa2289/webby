export class Utils {
    static clamp(x: number, min: number, max: number): number {
        return Math.min(Math.max(x, min), max)
    }

    static mod(x: number, div: number): number {
        return x - Math.floor(Math.abs(x) / div) * div * Math.sign(x)
    }
}
