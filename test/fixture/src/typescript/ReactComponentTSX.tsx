// @ts-expect-error
import React from 'react';

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
const ReactComponentTSX: React.FC<ReactComponentTSXProps> = (props: ReactComponentTSXProps) => {
   return <div>{props.title}</div>;
};

export default ReactComponentTSX;
