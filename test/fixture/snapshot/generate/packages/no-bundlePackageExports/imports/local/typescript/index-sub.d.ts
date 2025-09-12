import { TestAlias } from 'test-package';

declare const subTest: TestAlias;

type SubTestAlias = {
  bar: boolean;
};

export { subTest };
export type { SubTestAlias };
