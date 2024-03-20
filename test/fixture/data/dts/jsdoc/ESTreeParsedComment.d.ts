/**
 * Provides a more flexible mechanism to modify JSDoc comment blocks. `comment-parser` is the main parsing mechanism
 * that `esm-d-ts` uses as well as the supporting package `@es-joy/jsdoccomment` for ESTree AST compatible parsing. The
 * latter AST format is much easier to modify and recreate a comment block.
 */
export class ESTreeParsedComment {
    /**
     * @param {string}   rawComment - A JSDoc comment string.
     */
    constructor(rawComment: string);
    /**
     * @returns {import('@es-joy/jsdoccomment').JsdocBlock} ESTree AST.
     */
    get ast(): import("@es-joy/jsdoccomment").JsdocBlock;
    /**
     * Removes the JSDoc tags specified from the AST.
     *
     * @param {string | Iterable<string> | undefined} [tagNames] - A string or Set of strings defining tag names to
     *        remove from the AST. When undefined _all_ tags are removed.
     *
     * @returns {this} This instance.
     */
    removeTags(tagNames?: string | Iterable<string> | undefined): this;
    /**
     * Provides an iterator over all tags or a subset from the given tag names.
     *
     * @param {string | Iterable<string>} [tagNames] - A string or Set of strings defining tag names to iterate.
     *
     * @returns {IterableIterator<import('@es-joy/jsdoccomment').JsdocTag>} Tag iterator.
     * @yields {import('@es-joy/jsdoccomment').JsdocTag}
     */
    tags(tagNames?: string | Iterable<string>): IterableIterator<import('@es-joy/jsdoccomment').JsdocTag>;
    /**
     * @returns {string} Returns the comment block with current AST converted back to a string.
     */
    toString(): string;
    #private;
}
