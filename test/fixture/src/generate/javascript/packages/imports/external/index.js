// Tests `imports` from `package.json` parsing / loading.
// "#importsForTesting/*": "@esm-d-ts-test/*" -> `org` is the sub-path.
// "#importsForTesting2": "esm-d-ts-test-default"

export * from '#importsForTesting/org';
export * from 'esm-d-ts-test-basic';
export * from '#importsForTesting2';
