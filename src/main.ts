import { EditorView } from "@codemirror/view";
import { basicSetup } from "codemirror";
import cytoscape from "cytoscape";
import dagre from "cytoscape-dagre";
import { Language, Parser } from "web-tree-sitter";
import { example } from "./example.js";
import { interpret } from "./interpret2.js";
import { parse } from "./ir.js";
import { stackify } from "./stack.js";

cytoscape.use(dagre);

const editorView: HTMLElement = document.getElementById("editor");
const treeContainer: HTMLElement = document.getElementById("treeContainer");

let editor: EditorView;
let parser: Parser;
let ParBeginParEnd: Language;

const go = (doc) => {
	const tree = parser.parse(doc);
	const ir = parse(tree);
	const stack = stackify(ir);
	const graph = interpret(stack);

	cytoscape({
		container: treeContainer,
		elements: graph,
		layout: {
			name: "dagre",
		},
		style: [
			{
				selector: "node",
				css: {
					label: "data(label)",
				},
			},
		],
	});
};

const update = EditorView.updateListener.of((update) => {
	if (update.docChanged) {
		const doc = update.state.doc.toString();
		document.location.hash = encodeURI(doc);
		go(doc);
	}
});

const share = decodeURI(document.location.hash.substring(1));
const code = share ? share : example;

(async () => {
	await Parser.init();
	parser = new Parser();
	ParBeginParEnd = await Language.load("tree-sitter-parbeginparend.wasm");
	parser.setLanguage(ParBeginParEnd);
	editor = new EditorView({
		extensions: [basicSetup, update],
		parent: editorView,
		doc: code,
	});
	go(code);
})();
