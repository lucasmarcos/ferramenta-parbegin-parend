import { Parser, Language } from "web-tree-sitter";
import { basicSetup } from "codemirror";
import { EditorView } from "@codemirror/view";

const editorView: HTMLElement = document.getElementById("editor");
const treeContainer: HTMLElement = document.getElementById("treeContainer");

let editor;

let parser: Parser;
let ParBeginParEnd: Language;

(async () => {
  await Parser.init();
  parser = new Parser();
  // let ParBeginParEnd = await Language.load("tree-sitter-parbeginparend.wasm");
  // parser.setLanguage(ParBeginParEnd);
  editor = new EditorView({
    extensions: [
      basicSetup,
    ],
    parent: editorView,
  });
})();
