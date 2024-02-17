// @ts-expect-error
import React from 'react';

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
const ReactComponentJSX = (props) => {
   return <div>{props.title}</div>;
};

export default ReactComponentJSX;
