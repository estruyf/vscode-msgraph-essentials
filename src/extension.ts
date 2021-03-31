import * as vscode from 'vscode';
import { CssVariableProvider } from './providers/CssVariableProvider';

export function activate(context: vscode.ExtensionContext) {
	const provider = vscode.languages.registerCompletionItemProvider([
		{ language: 'css' },
		{ language: 'less' },
		{ language: 'scss' },
		{ language: 'stylus' },
		{ language: 'sass' },
		{ language: 'html' },
		{ language: 'postcss' },
	], new CssVariableProvider(context), '-');

	context.subscriptions.push(provider);

	console.log(`vscode-msgraph-essentials activated`);
}

export function deactivate() {}
