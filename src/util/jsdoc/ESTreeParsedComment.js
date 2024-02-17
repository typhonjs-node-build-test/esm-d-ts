import {
   commentParserToESTree,
   estreeToString,
   parseComment }       from '@es-joy/jsdoccomment';

import { isIterable }   from '@typhonjs-utils/object';

/**
 * Provides a more flexible mechanism to modify JSDoc comment blocks. `comment-parser` is the main parsing mechanism
 * that `esm-d-ts` uses as well as the supporting package `@es-joy/jsdoccomment` for ESTree AST compatible parsing. The
 * latter AST format is much easier to modify and recreate a comment block.
 */
export class ESTreeParsedComment
{
   /** @type {import('@es-joy/jsdoccomment').JsdocBlock} */
   #ast;

   /**
    * @param {string}   rawComment - A JSDoc comment string.
    */
   constructor(rawComment)
   {
      this.#ast = commentParserToESTree(parseComment(rawComment), 'typescript');
   }

   /**
    * @returns {import('@es-joy/jsdoccomment').JsdocBlock} ESTree AST.
    */
   get ast()
   {
      return this.#ast;
   }

   /**
    * Removes the JSDoc tags specified from the AST.
    *
    * @param {string | Iterable<string> | undefined} [tagNames] - A string or Set of strings defining tag names to
    *        remove from the AST. When undefined _all_ tags are removed.
    *
    * @returns {this} This instance.
    */
   removeTags(tagNames)
   {
      const isString = typeof tagNames === 'string';
      const isList = isIterable(tagNames);

      if (tagNames !== void 0 && !isString && !isList)
      {
         throw new TypeError(
          `ESTreeParsedComment.removeTags error: 'tagNames' is not a string or iterable list of strings.`);
      }

      const tags = this.#ast.tags;

      if (isString)
      {
         for (let i = tags.length; --i >= 0;)
         {
            if (tags[i].tag === tagNames) { tags.splice(i, 1); }
         }
      }
      else if (isList)
      {
         const tagSet = tagNames instanceof Set ? tagNames : new Set(tagNames);
         for (let i = tags.length; --i >= 0;)
         {
            if (tagSet.has(tags[i].tag)) { tags.splice(i, 1); }
         }
      }
      else
      {
         tags.length = 0;
      }

      return this;
   }

   /**
    * Provides an iterator over all tags or a subset from the given tag names.
    *
    * @param {string | Iterable<string>} [tagNames] - A string or Set of strings defining tag names to iterate.
    *
    * @returns {IterableIterator<import('@es-joy/jsdoccomment').JsdocTag>} Tag iterator.
    * @yields {import('@es-joy/jsdoccomment').JsdocTag}
    */
   *tags(tagNames)
   {
      const isString = typeof tagNames === 'string';
      const isList = isIterable(tagNames);

      if (tagNames !== void 0 && !isString && !isList)
      {
         throw new TypeError(`ESTreeParsedComment.tags error: 'tagNames' is not a string or iterable list of strings.`);
      }

      const tags = this.#ast.tags;

      if (isString)
      {
         for (let i = 0; i < tags.length; i++)
         {
            if (tags[i].tag === tagNames) { yield tags[i]; }
         }
      }
      else if (isList)
      {
         const tagSet = tagNames instanceof Set ? tagNames : new Set(tagNames);
         for (let i = 0; i < tags.length; i++)
         {
            if (tagSet.has(tags[i].tag)) { yield tags[i]; }
         }
      }
      else
      {
         for (let i = 0; i < tags.length; i++)
         {
            yield tags[i];
         }
      }
   }

   /**
    * @returns {string} Returns the comment block with current AST converted back to a string.
    */
   toString()
   {
      return estreeToString(this.#ast);
   }
}
