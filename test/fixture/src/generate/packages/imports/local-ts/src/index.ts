import type { SubTestAlias } from '#test-package/sub';

type TestAlias = {
   foo: boolean;
}

const test: SubTestAlias = { bar: true };

export { test, TestAlias };
