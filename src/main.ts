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

  console.log(tree.rootNode);

  let q = [];

  for (let i = 0; i < tree.rootNode.childCount; i++) {
    const type = tree.rootNode.child(i).type;

    switch (type) {
      case "begin": {
        q.push("begin");
        break;
      }
      case "end": {
        const last = q.pop();
        if (last !== "begin") {
          console.log("error");
        }
        break;
      }
      case "parbegin": {
        q.push("parbegin");
        break;
      }
      case "parend": {
        const last = q.pop();
        if (last !== "parbegin") {
          console.log("error");
        }
        break;
      }
      case "call": {
        console.log(tree.rootNode.child(i).child(0).text);
        break;
      }
     }
  }
})();
