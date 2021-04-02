import * as fs from 'fs';
import * as path from 'path';
import { CancellationToken, CompletionItem, CompletionItemKind, CompletionItemProvider, ExtensionContext, Position, TextDocument } from 'vscode';
import { HtmlSnippet } from '../models/HtmlSnippet';

const enum Constants {
  prefix = "mgt"
}

const HTML_FOLDER = '../../autocomplete/html';

export class HtmlVariableProvider implements CompletionItemProvider {
  private files: string[] = [];
  private snippets: { [fileName: string]: HtmlSnippet[] } = {};
  
  constructor(private context: ExtensionContext) {
    const htmlCompetion = path.join(__dirname, HTML_FOLDER);
    this.files = fs.readdirSync(htmlCompetion);
    this.snippets = {};
  }

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


    let suggestions: CompletionItem[] = [];
    for (const file of this.files) {
      const fileName = path.parse(file).name;
      if (line.includes(`<${fileName} `)) {

        if (!this.snippets[fileName]) {
          const fullPath = path.join(__dirname, HTML_FOLDER, file);
          const contents = fs.readFileSync(fullPath, { encoding: "utf-8" });
          if (contents) {
            const htmlSnippets: HtmlSnippet[] = JSON.parse(contents);

            suggestions = htmlSnippets.map(s => {
              const suggestion = new CompletionItem(s.attribute, CompletionItemKind.Property);
              if (s.description) {
                suggestion.documentation = s.description;
              }
              return suggestion;
            });
          }
        }
      }
    }

    return suggestions;
  }
}