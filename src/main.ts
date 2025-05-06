import { EditorView } from "@codemirror/view";
import { basicSetup } from "codemirror";
import cytoscape from "cytoscape";
import dagre from "cytoscape-dagre";
import { Language, Parser } from "web-tree-sitter";
import { example } from "./example.js";
import { interpret } from "./interpret.js";
import { parse } from "./ir.js";
import { stackify } from "./stack.js";

cytoscape.use(dagre);

const editorView: HTMLElement = document.getElementById("editor");
const treeContainer: HTMLElement = document.getElementById("treeContainer");

let editor: EditorView;
let parser: Parser;
let ParBeginParEnd: Language;

(async () => {
	await Parser.init();
	parser = new Parser();
	ParBeginParEnd = await Language.load("tree-sitter-parbeginparend.wasm");
	parser.setLanguage(ParBeginParEnd);
	editor = new EditorView({
		extensions: [basicSetup],
		parent: editorView,
		doc: example,
	});

	const tree = parser.parse(example);
	const ir = parse(tree);
	const current = stackify(ir);
	const graph = interpret(current, undefined, undefined);

	cytoscape({
		container: treeContainer,
		elements: [
			{ data: { id: "A" } },
			{ data: { id: "B" } },
			{ data: { source: "A", target: "B" } },
		],
		layout: {
			name: "dagre",
		},
		style: [
			{
				selector: "node",
				css: {
					label: "data(id)",
				},
			},
		],
	});
})();
