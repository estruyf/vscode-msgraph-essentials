import snippets = require('../css.variables.json');
import { CancellationToken, CompletionItem, CompletionItemKind, CompletionItemProvider, ExtensionContext, MarkdownString, Position, TextDocument } from 'vscode';
import { CssSnippet } from '../models/CssSnippet';

const enum Constants {
  prefix = "--"
}

const cssRegex = /^\s*--([a-z0-9_-]*)/i;

export class CssVariableProvider implements CompletionItemProvider {
  
  constructor(private context: ExtensionContext) {}

  /**
  * CSS Variable provider
  * @param document 
  * @param position 
  * @param token 
  * @returns 
  */
  public async provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken): Promise<CompletionItem[]> {
    const line = document.lineAt(position).text;
    const varExprStart = line.lastIndexOf(Constants.prefix, position.character);
    
    if (varExprStart === -1) {
      return [];
    }
    
    const varMatch = cssRegex.exec(line.slice(varExprStart));
    if (!varMatch) {
      return [];
    }

    return (snippets as CssSnippet[]).map(s => {
      let type = CompletionItemKind.Value;
      switch(s.type) {
        case "string":
          type = CompletionItemKind.Value;
          break;
        case "length":
          type = CompletionItemKind.Unit;
          break;
        case "color":
          type = CompletionItemKind.Color;
          break;
        default:
          type = CompletionItemKind.Value;
          break;
      }

      const suggestion = new CompletionItem(s.key, type);
      if (s.description) {
        suggestion.documentation = new MarkdownString(`### Component: \`${s.component}\`

${s.description}`);
      }
      suggestion.insertText = s.key.substring(2);
      return suggestion;
    });
  }
}