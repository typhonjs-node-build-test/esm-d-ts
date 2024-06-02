import { TestAlias } from 'test-package';

declare const subTest: TestAlias;

type SubTestAlias = {
  bar: boolean;
};

export { type SubTestAlias, subTest };
