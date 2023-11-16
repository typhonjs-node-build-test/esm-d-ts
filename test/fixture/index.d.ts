/**
 * A base class to test `inheritDoc`.
 */
declare class Base {
    /**
     * @param {number}   one - First parameter
     *
     * @param {string}   two - Second parameter
     *
     * @param {boolean}  three - Third parameter
     */
    thing(one: number, two: string, three: boolean): void;
}

/**
 * @inheritDoc
 */
declare class Inherited extends Base {
    /**
     * @inheritDoc
     */
    thing(one: any, two: any, three: any): void;
}

/** @typedef {number} DataFieldOptions */
/** @typedef {number} FilePathFieldOptions */
declare class SchemaField {
}
type DataFieldOptions = number;
type FilePathFieldOptions = number;

/**
 * Some base class.
 */
declare class A {
    /**
     * Log a provided name to the console.
     *
     * @param {string} name - The name to log.
     */
    logName(name: string): void;
}

declare interface MyMixin {
    /**
     * Add one to the provided number.
     *
     * @param {number} n - The number to increment.
     *
     * @returns {number} - The incremented number.
     */
    addOne(n: number): number;
}

declare const B_base: typeof A & (new (...args: any[]) => MyMixin);
/**
 * Extended class with mixin behavior. Extends {@link A} and mixes in {@link MyMixin}
 */
declare class B extends B_base {
}

/**
 * Mixin function that adds `addOne` method to a base class.
 *
 * @template T
 *
 * @param {T} BaseClass - The base class to be extended.
 *
 * @returns {T & new (...args: any[]) => import('./types').MyMixin} The mixed class.
 */
declare function mixin<T>(BaseClass: T): T & (new (...args: any[]) => MyMixin);

/** @type {import("./fields").DataFieldOptions} */
declare const x: DataFieldOptions;
declare class TextureData {
    /**
     * @param {import("./fields").DataFieldOptions} options  Options which are forwarded to the SchemaField constructor
     *
     * @param {object} [opts] - Additional options.
     *
     * @param {import("./fields").FilePathFieldOptions} [opts.categories] Additional options for the src field
     *
     * @param {import("./fields").FilePathFieldOptions} [opts.initial] Additional options for the src field
     *
     * @param {import("./fields").FilePathFieldOptions} [opts.wildcard] Additional options for the src field
     *
     * @param {import("./fields").FilePathFieldOptions} [opts.label] Additional options for the src field
     */
    constructor(options: DataFieldOptions, { categories, initial, wildcard, label }?: {
        categories?: FilePathFieldOptions;
        initial?: FilePathFieldOptions;
        wildcard?: FilePathFieldOptions;
        label?: FilePathFieldOptions;
    });
    /**
     * Example of linking TS Lib API docs. `Promise` as well as `HTMLDivElement` is a known symbol and linked.
     *
     * @returns {Promise<[HTMLDivElement]>}
     */
    loadTexture(): Promise<[HTMLDivElement]>;
}

export { A, B, Base, DataFieldOptions, FilePathFieldOptions, Inherited, MyMixin, SchemaField, TextureData, mixin, x };
