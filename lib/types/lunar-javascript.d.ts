declare module 'lunar-javascript' {
  export class Lunar {
    static fromYmd(year: number, month: number, day: number): Lunar
    getSolar(): Solar
    toYmd(): string
  }

  export class Solar {
    toYmd(): string
  }
}
