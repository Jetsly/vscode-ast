// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { SELECTION_CODE, AstModel, AstTreeDataProvider, posToLine } from './astExplorer';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const astModel = new AstModel();
  const treeDataProvider = new AstTreeDataProvider(astModel);
  let isEnable = vscode.workspace.getConfiguration('ast').get('enable');
  vscode.commands.executeCommand('setContext', 'astEnable', isEnable);
  vscode.window.createTreeView('ast.views.explorer', {
    treeDataProvider,
  });
  context.subscriptions.push(
    vscode.commands.registerCommand(SELECTION_CODE, (pos, end) => {
      const editor = vscode.window.activeTextEditor;
      if (editor !== undefined) {
        const code: string = editor.document.getText();
        editor.selection = new vscode.Selection(posToLine(code, pos), posToLine(code, end));
        // const range = editor.visibleRanges[0];
        // const [viewStart, viewEnd] = range;
        // const halfViewH = (viewEnd.line - viewStart.line) / 2;
        const halfViewH = 15;
        const targetLine = code.slice(0, pos).split('\n').length;
        const posStart = targetLine - halfViewH < 0 ? 0 : targetLine - halfViewH;
        const posEnd = targetLine + halfViewH;
        editor.revealRange(new vscode.Range(posStart, 0, posEnd, 0 ));
      }
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('ast.views.explorer.refreshEntry', () =>
      treeDataProvider.refresh()
    )
  );
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(() => {
      isEnable = vscode.workspace.getConfiguration('ast').get('enable');
    })
  );
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(() => {
      if (
        isEnable &&
        vscode.window.activeTextEditor &&
        vscode.window.activeTextEditor.document.uri.scheme === 'file' &&
        ['javascript', 'javascriptreact', 'typescript', 'typescriptreact'].indexOf(
          vscode.window.activeTextEditor.document.languageId
        ) > -1
      ) {
        vscode.commands.executeCommand('setContext', 'astEnable', true);
        treeDataProvider.refresh();
      } else {
        vscode.commands.executeCommand('setContext', 'astEnable', false);
      }
    })
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
