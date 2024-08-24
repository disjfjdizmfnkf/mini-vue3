import { isString } from '@vue/shared'
// import { CREATE_ELEMENT_VNODE } from './runtimeHelpers'

export const enum NodeTypes {
	ROOT,
	ELEMENT,
	TEXT,
	COMMENT,
	SIMPLE_EXPRESSION,
	INTERPOLATION,
	ATTRIBUTE,
	DIRECTIVE,
	COMPOUND_EXPRESSION,
	IF,
	IF_BRANCH,
	FOR,
	TEXT_CALL,
	VNODE_CALL,
	JS_CALL_EXPRESSION,
	JS_OBJECT_EXPRESSION,
	JS_PROPERTY,
	JS_ARRAY_EXPRESSION,
	JS_FUNCTION_EXPRESSION,
	JS_CONDITIONAL_EXPRESSION,
	JS_CACHE_EXPRESSION,
	JS_BLOCK_STATEMENT,
	JS_TEMPLATE_LITERAL,
	JS_IF_STATEMENT,
	JS_ASSIGNMENT_EXPRESSION,
	JS_SEQUENCE_EXPRESSION,
	JS_RETURN_STATEMENT
}

export const enum ElementTypes {
	ELEMENT,
	COMPONENT,
	SLOT,
	TEMPLATE
}

interface VNodeCall {
	type: NodeTypes.VNODE_CALL;
	tag: string;
	props?: any;
	children?: any;
}

interface CompoundExpression {
	type: NodeTypes.COMPOUND_EXPRESSION;
	loc: any;
	children: any;
}

interface ConditionalExpression {
	type: NodeTypes.JS_CONDITIONAL_EXPRESSION;
	test: any;
	consequent: any;
	alternate: any;
	newline: boolean;
	loc: any;
}

interface CallExpression {
	type: NodeTypes.JS_CALL_EXPRESSION;
	loc: any;
	callee: any;
	arguments: any;
}

interface SimpleExpression {
	type: NodeTypes.SIMPLE_EXPRESSION;
	loc: any;
	content: string;
	isStatic: boolean;
}

interface ObjectProperty {
	type: NodeTypes.JS_PROPERTY;
	loc: any;
	key: SimpleExpression | any;
	value: any;
}

export function createVNodeCall(context: any, tag: string, props?: any, children?: any): VNodeCall {
	if (context) {
		// context.helper(CREATE_ELEMENT_VNODE)
	}

	return {
		type: NodeTypes.VNODE_CALL,
		tag,
		props,
		children
	}
}

export function createCompoundExpression(children: any, loc: any): CompoundExpression {
	return {
		type: NodeTypes.COMPOUND_EXPRESSION,
		loc,
		children
	}
}

export function createConditionalExpression(
	test: any,
	consequent: any,
	alternate: any,
	newline = true
): ConditionalExpression {
	return {
		type: NodeTypes.JS_CONDITIONAL_EXPRESSION,
		test,
		consequent,
		alternate,
		newline,
		loc: {}
	}
}

export function createCallExpression(callee: any, args: any): CallExpression {
	return {
		type: NodeTypes.JS_CALL_EXPRESSION,
		loc: {},
		callee,
		arguments: args
	}
}

export function createSimpleExpression(content: string, isStatic: boolean): SimpleExpression {
	return {
		type: NodeTypes.SIMPLE_EXPRESSION,
		loc: {},
		content,
		isStatic
	}
}

export function createObjectProperty(key: string | any, value: any): ObjectProperty {
	return {
		type: NodeTypes.JS_PROPERTY,
		loc: {},
		key: isString(key) ? createSimpleExpression(key, true) : key,
		value
	}
}