// This will cause a TS diagnostic warning / transpiling will succeed without the import statement.
import { noop } from './empty';
import { nope } from './missing.ts';

export const test = 'ABC';
