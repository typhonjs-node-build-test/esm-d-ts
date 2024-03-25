/**
 * A test
 *
 * @module
 */

import React from 'react';

declare const jsExtension = "Can load '.js' extension.";

declare const noExtension = "Can load '.ts' from no extension.";

declare class Test {
  /**
   * A test of TS declaration generation.
   */
  foo(): boolean;
}

/**
 * Represents props for ReactComponentJSX.
 */
type ReactComponentJSXProps = {
  /**
   * The title of the component.
   */
  title: string;
};
/**
 * @typedef {object} ReactComponentJSXProps Represents props for ReactComponentJSX.
 *
 * @property {string} title The title of the component.
 */
/**
 * Renders MyComponent.
 * @param {ReactComponentJSXProps} props - The props for the component.
 * @returns The ReactComponentJSX JSX.
 */
declare function ReactComponentJSX(props: ReactComponentJSXProps): any;

/**
 * Represents props for ReactComponentTSX.
 */
interface ReactComponentTSXProps {
  /** The title of the component. */
  title: string;
}
/**
 * Renders ReactComponentTSX.
 */
declare const ReactComponentTSX: React.FC<ReactComponentTSXProps>;

export { ReactComponentJSX, ReactComponentTSX, Test, jsExtension, noExtension };
