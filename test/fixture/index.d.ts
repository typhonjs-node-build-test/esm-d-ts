/**
 * A base class to test `inheritdoc`.
 */
declare class Base {
    /**
     * Required parameters.
     *
     * @param {number}   one - First parameter
     *
     * @param {string}   two - Second parameter
     *
     * @param {boolean}  three - Third parameter
     */
    foo(one: number, two: string, three: boolean): void;
    /**
     * Required object parameters.
     *
     * @param {object}   options - options
     *
     * @param {number}   options.one - First parameter
     *
     * @param {string}   options.two - Second parameter
     *
     * @param {boolean}  options.three - Third parameter
     *
     * @returns {boolean} Boolean result.
     */
    bar(options: {
        one: number;
        two: string;
        three: boolean;
    }): boolean;
    /**
     * Required object parameters.
     *
     * @param {object}   options - options
     *
     * @param {number}   options.one - First parameter
     *
     * @param {string}   options.two - Second parameter
     *
     * @param {boolean}  options.three - Third parameter
     *
     * @returns {boolean} Boolean result.
     */
    zap({ one, two, three }: {
        one: number;
        two: string;
        three: boolean;
    }): boolean;
    /**
     * Optional object parameters.
     *
     * @param {object}   [options] - options
     *
     * @param {number}   [options.one] - First parameter
     *
     * @param {string}   [options.two] - Second parameter
     *
     * @param {boolean}  [options.three] - Third parameter
     *
     * @returns {string} String result.
     */
    bang({ one, two, three }?: {
        one?: number;
        two?: string;
        three?: boolean;
    }): string;
    /**
     * Optional object parameters.
     *
     * @param {object}   [options] - options
     *
     * @param {number}   [options.one] - First parameter
     *
     * @param {string}   [options.two] - Second parameter
     *
     * @param {boolean}  [options.three] - Third parameter
     *
     * @returns {{ foo: boolean, bar: boolean }} Object result
     */
    boom({ one, two, three }?: {
        one?: number;
        two?: string;
        three?: boolean;
    }): {
        foo: boolean;
        bar: boolean;
    };
}

/**
 * @inheritDoc
 */
declare class Inherited1_A extends Base {
    /**
     * @inheritDoc
     */
    foo(one: any, two: any, three: any): void;
    /**
     * @inheritDoc
     */
    bar(options: any): boolean;
    /**
     * @inheritDoc
     */
    zap({ one, two, three }: {
        one: any;
        two: any;
        three: any;
    }): boolean;
    /**
     * @inheritDoc
     */
    bang(options: any): string;
    /**
     * @inheritDoc
     */
    boom(options: any): {
        foo: boolean;
        bar: boolean;
    };
}

/**
 * @inheritdoc
 */
declare class Inherited1_B extends Base {
    /**
     * @inheritdoc
     */
    foo(one: any, two: any, three: any): void;
    /**
     * @inheritdoc
     */
    bar(options: any): boolean;
    /**
     * @inheritdoc
     */
    zap({ one, two, three }: {
        one: any;
        two: any;
        three: any;
    }): boolean;
    /**
     * @inheritdoc
     */
    bang(options: any): string;
    /**
     * @inheritdoc
     */
    boom(options: any): {
        foo: boolean;
        bar: boolean;
    };
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

declare interface BaseMixin {
    /**
     * Add one to the provided number.
     *
     * @param {number} n - The number to increment.
     *
     * @returns {number} - The incremented number.
     */
    addOne(n: number): number;
}
declare interface MyMixin extends BaseMixin {
    /**
     * Add two to the provided number.
     *
     * @param {number} n - The number to increment.
     *
     * @returns {number} - The incremented number.
     */
    addTwo(n: number): number;
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

export { A, B, Base, BaseMixin, DataFieldOptions, FilePathFieldOptions, Inherited1_A, Inherited1_B, MyMixin, SchemaField, TextureData, mixin, x };
