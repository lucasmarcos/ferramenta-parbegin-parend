import { Parser, Language } from "web-tree-sitter";
import { basicSetup } from "codemirror";
import { EditorView } from "@codemirror/view";

const editorView: HTMLElement = document.getElementById("editor");
const treeContainer: HTMLElement = document.getElementById("treeContainer");

const example = `BEGIN
  A;
  PARBEGIN
    B;
    C;
    D;
  PAREND
  E;
END
`;

let editor;

let parser: Parser;
let ParBeginParEnd: Language;

(async () => {
  await Parser.init();
  parser = new Parser();
  let ParBeginParEnd = await Language.load("tree-sitter-parbeginparend.wasm");
  parser.setLanguage(ParBeginParEnd);
  editor = new EditorView({
    extensions: [
      basicSetup,
    ],
    parent: editorView,
    doc: example,
  });

  const tree = parser.parse(example);
  console.log(tree.rootNode.toString());
})();
