import { EditorView } from "@codemirror/view";
import { basicSetup } from "codemirror";
import cytoscape from "cytoscape";
import dagre from "cytoscape-dagre";
import { Language, Parser } from "web-tree-sitter";

const editorView: HTMLElement = document.getElementById("editor");
const treeContainer: HTMLElement = document.getElementById("treeContainer");

cytoscape.use(dagre);

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

const findFirstLabel = (node) => {
	if (node.type === "call") {
		return node.label;
	} else if (node.type === "seq" || node.type === "par") {
		return findFirstLabel(node.child[0]);
	}
	return null;
};

const interpret = (node, last, parentNext = null) => {
	if (node.type === "seq") {
		for (let i = 0; i < node.child.length; i++) {
			const child = node.child[i];
			const next = node.child[i + 1]
				? findFirstLabel(node.child[i + 1])
				: parentNext;

			last = interpret(child, last, next);
		}
		return last;
	} else if (node.type === "par") {
		const outputs = [];

		for (const child of node.child) {
			const output = interpret(child, last, parentNext);
			outputs.push(output);
		}

		for (const output of outputs) {
			if (output && parentNext) {
				console.log(`"${output}" -> "${parentNext}";`);
			}
		}

		return parentNext;
	} else if (node.type === "call") {
		if (last) {
			console.log(`"${last}" -> "${node.label}";`);
		}
		return node.label;
	}
};

(async () => {
	await Parser.init();
	parser = new Parser();
	const ParBeginParEnd = await Language.load("tree-sitter-parbeginparend.wasm");
	parser.setLanguage(ParBeginParEnd);
	editor = new EditorView({
		extensions: [basicSetup],
		parent: editorView,
		doc: example,
	});

	const tree = parser.parse(example);

	const q = [];
	const ir = [];

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

	const stack = [];
	let current = [];
	for (let i = 0; i < ir.length; i++) {
		if (ir[i] === "[") {
			const node = { type: "seq", child: current };
			stack.push(node);
			current = [];
		} else if (ir[i] === "(") {
			const node = { type: "par", child: current };
			stack.push(node);
			current = [];
		} else if (ir[i] === "]" || ir[i] === ")") {
			const last = stack.pop();
			const node = { type: last.type, child: current };
			current = last.child;
			current.push(node);
		} else {
			current.push({ type: "call", label: ir[i] });
		}
	}

	console.log("digraph {");
	interpret(current[0], undefined, undefined);
	console.log("}");

	const cy = cytoscape({
		container: treeContainer,
		elements: [
			{ data: { id: "A" } },
			{ data: { id: "B" } },
			{ data: { id: "C" } },
			{ data: { id: "D" } },
			{ data: { id: "E" } },
			{ data: { id: "F" } },

			{ data: { source: "A", target: "B" } },
			{ data: { source: "A", target: "D" } },
			{ data: { source: "B", target: "C" } },
			{ data: { source: "D", target: "E" } },
			{ data: { source: "C", target: "F" } },
			{ data: { source: "E", target: "F" } },
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
