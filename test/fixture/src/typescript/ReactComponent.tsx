// @ts-expect-error
import React from 'react';

/**
 * Represents props for MyComponent.
 * @param {string} title - The title of the component.
 */
interface ReactComponentProps {
   title: string;
}

/**
 * Renders MyComponent.
 * @param {ReactComponentProps} props - The props for the component.
 * @returns The MyComponent JSX.
 */
const ReactComponent: React.FC<ReactComponentProps> = (props) => {
   return <div>{props.title}</div>;
};

export default ReactComponent;
