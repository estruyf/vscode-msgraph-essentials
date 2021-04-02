import * as vscode from 'vscode';
import { CssVariableProvider } from './providers/CssVariableProvider';
import { HtmlVariableProvider } from './providers/HtmlVariableProvider';

export function activate(context: vscode.ExtensionContext) {

	const openDocs = vscode.commands.registerCommand('msgraph.essentials.openDocs', async () => {
		vscode.commands.executeCommand('vscode.open', vscode.Uri.parse('https://docs.microsoft.com/en-us/graph/api/overview?view=graph-rest-1.0'));
	});
	context.subscriptions.push(openDocs);

	const openGraphExplorer = vscode.commands.registerCommand('msgraph.essentials.openGraphExplorer', async () => {
		vscode.commands.executeCommand('vscode.open', vscode.Uri.parse('https://developer.microsoft.com/en-us/graph/graph-explorer'));
	});
	context.subscriptions.push(openGraphExplorer);

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
