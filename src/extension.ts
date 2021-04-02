import * as vscode from 'vscode';
import { CssVariableProvider } from './providers/CssVariableProvider';
import { HtmlVariableProvider } from './providers/HtmlVariableProvider';

export function activate(context: vscode.ExtensionContext) {
	const cssProvider = vscode.languages.registerCompletionItemProvider([
		{ language: 'css' },
		{ language: 'less' },
		{ language: 'scss' },
		{ language: 'stylus' },
		{ language: 'sass' },
		{ language: 'html' },
		{ language: 'postcss' },
	], new CssVariableProvider(context), '-');

	context.subscriptions.push(cssProvider);
	
	const htmlProvider = vscode.languages.registerCompletionItemProvider([
		{ language: 'html' }
	], new HtmlVariableProvider(context), " ");

	context.subscriptions.push(htmlProvider);

	console.log(`vscode-msgraph-essentials activated`);
}

export function deactivate() {}
