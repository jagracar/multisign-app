
export const tokens = [
    {
        name: 'OBJKT',
        fa2: 'KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton',
        multiasset: true,
        website: 'https://hicetnunc.art/objkt/'
    },
    {
        name: 'hDAO',
        fa2: 'KT1AFA2mwNUMNd4SsujE1YYp29vd8BZejyKW',
        multiasset: false,
        website: undefined
    },
    {
        name: 'Tezzardz',
        fa2: 'KT1LHHLso8zQWQWg1HUukajdxxbkGfNoHjh6',
        multiasset: true,
        website: 'https://objkt.com/asset/tezzardz/'
    },
    {
        name: 'PRJKTNEON',
        fa2: 'KT1VbHpQmtkA3D4uEbbju26zS8C42M5AGNjZ',
        multiasset: true,
        website: 'https://objkt.com/asset/prjktneon',
    },
    {
        name: 'Art Cardz',
        fa2: 'KT1LbLNTTPoLgpumACCBFJzBEHDiEUqNxz5C',
        multiasset: true,
        website: 'https://objkt.com/asset/artcardz'
    },
    {
        name: 'GOGOs',
        fa2: 'KT1SyPgtiXTaEfBuMZKviWGNHqVrBBEjvtfQ',
        multiasset: true,
        website: 'https://objkt.com/asset/gogos/'
    },
    {
        name: 'NEONZ',
        fa2: 'KT1MsdyBSAMQwzvDH4jt2mxUKJvBSWZuPoRJ',
        multiasset: true,
        website: 'https://objkt.com/asset/neonz/'
    },
    {
        name: 'Randomly Common Skeles',
        fa2: 'KT1HZVd9Cjc2CMe3sQvXgbxhpJkdena21pih',
        multiasset: true,
        website: 'https://objkt.com/asset/rcs/'
    },
    {
        name: 'fx_hash',
        fa2: 'KT1KEa8z6vWXDJrVqtMrAeDVzsvxat3kHaCE',
        multiasset: true,
        website: 'https://www.fxhash.xyz/gentk/'
    },
    {
        name: 'ZIGGURATS',
        fa2: 'KT1PNcZQkJXMQ2Mg92HG1kyrcu3auFX5pfd8',
        multiasset: true,
        website: 'https://objkt.com/asset/ziggurats/'
    }
]

export function stringToHex(str) {
    return Array.from(str).reduce((hex, c) => hex += c.charCodeAt(0).toString(16).padStart(2, '0'), '');
}

export function hexToString(hex) {
    return hex.match(/.{1,2}/g).reduce((acc, char) => acc + String.fromCharCode(parseInt(char, 16)), '');
}
