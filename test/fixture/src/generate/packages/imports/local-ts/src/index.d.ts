import type { SubTestAlias } from '#test-package/sub';
type TestAlias = {
    foo: boolean;
};
declare const test: SubTestAlias;
export { test, TestAlias };
