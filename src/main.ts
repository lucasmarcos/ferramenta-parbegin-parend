import { Parser, Language } from "web-tree-sitter";
import { basicSetup } from "codemirror";
import { EditorView } from "@codemirror/view";

const editorView: HTMLElement = document.getElementById("editor");
const treeContainer: HTMLElement = document.getElementById("treeContainer");

const example = `BEGIN
  A;
  PARBEGIN
    BEGIN
      B;
      C;
    END
    BEGIN
      D;
      E;
    END
  PAREND;
  F;
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

  let q = [];
  let ir = [];

  for (let i = 0; i < tree.rootNode.childCount; i++) {
    const type = tree.rootNode.child(i).type;

    switch (type) {
      case "begin": {
        q.push("begin");
        ir.push("[");
        break;
      }
      case "end": {
        const last = q.pop();
        if (last !== "begin") {
          console.log("error");
        }
        ir.push("]");
        break;
      }
      case "parbegin": {
        q.push("parbegin");
        ir.push("(");
        break;
      }
      case "parend": {
        const last = q.pop();
        if (last !== "parbegin") {
          console.log("error");
        }
        ir.push(")");
        break;
      }
      case "call": {
        ir.push(tree.rootNode.child(i).child(0).text);
        break;
      }
     }
  }

  let mode = [];
  let ids = [];
  let blocks = new Map();

  for (let i = 0; i < ir.length; i++) {
    if (ir[i] === '[') {
      mode.push("seq");
      ids.push(crypto.randomUUID());

      if (blocks.has(ids[ids.length - 1])) {
        blocks.get(ids[ids.length - 1]).push({ seq: ids[ids.length - 1] });
      }
    } else if (ir[i] === ']') {
      mode.pop();
      ids.pop();
    } else if (ir[i] === '(') {
      mode.push("par");
      ids.push(crypto.randomUUID());

      if (blocks.has(ids[ids.length - 1])) {
        blocks.get(ids[ids.length - 1]).push({ par: ids[ids.length - 1] });
      }
    } else if (ir[i][0] === ')') {
      mode.pop();
      ids.pop();
    } else {
      if (!blocks.has(ids[ids.length - 1])) {
        blocks.set(ids[ids.length - 1], []);
      }

      blocks.get(ids[ids.length - 1]).push({ label: ir[i] });
    }
  }

  /*
  let graph = "digraph { ";

  let last;

  for (let i = 0; i < sttmts.length; i++) {
     if (sttmts[i].next) {
      for (let j = 0; j < sttmts[i].next.length; j++) {
        graph = `${graph} "${sttmts[i].label}" -> "${sttmts[i].next[j].label}";`);
      }

    if (last) {
      if (last.next) {
        for (let j = 0; j < last.next.length; j++) {
          graph = `${graph} "${last.next[j].label}" -> "${sttmts[i].label}";`;
        }
      } else {
        graph = `${graph} "${last.label}" -> "${sttmts[i].label}";`;
      }
    }

    last = sttmts[i];
  }
  graph = `${graph} }`;
  console.log(graph);
  */
})();
