export function treatedAll(thing: never): never {
    throw Error(`did not treat: ${thing}`)
}
