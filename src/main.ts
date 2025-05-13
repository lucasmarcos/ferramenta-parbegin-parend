import { EditorView } from "@codemirror/view";
import { basicSetup } from "codemirror";
import cytoscape from "cytoscape";
import dagre from "cytoscape-dagre";
import { parser } from "../out/parser.js";
import { example } from "./example.js";
import { interpret } from "./interpret.js";
import { parse } from "./ir.js";
import { stackify } from "./stack.js";

cytoscape.use(dagre);

const editorView: HTMLElement = document.getElementById("editor");
const treeContainer: HTMLElement = document.getElementById("treeContainer");

const go = (doc) => {
	const tree = parser.parse(doc);
	const ir = parse(doc, tree);
	const stack = stackify(ir);
	const graph = interpret(stack);

	cytoscape({
		container: treeContainer,
		elements: graph,
		layout: { name: "dagre" },
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

new EditorView({
	extensions: [basicSetup, update],
	parent: editorView,
	doc: code,
});

go(code);
