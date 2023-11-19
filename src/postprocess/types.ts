import { Node } from 'ts-morph'

declare interface NameableNode extends Node
{
   getName(): string;
}

type NameableNodeConstructor = new (...args: any[]) => NameableNode;

export { NameableNode, NameableNodeConstructor }
