import type { TestAlias } from '#test-package';

const subTest: TestAlias = { foo: true };

export { subTest };

export type SubTestAlias = {
   bar: boolean;
}
