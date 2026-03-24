/**
 * This source file tests defining an array and a Set to the filter tags. Both `@hidden` and `@ignore` methods will
 * be removed from the public API / declarations generated.
 */
declare class JsdocFilterTags {
  /**
   * @hidden
   */
  foo(): void;
  /**
   * @ignore
   */
  bar(): void;
  /**
   * @internal
   */
  notPublic(): void;
}

export { JsdocFilterTags };
