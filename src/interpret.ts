/*

const findFirstLabel = (node) => {
	if (node.type === "call") {
		return node.label;
	} else if (node.type === "seq" || node.type === "par") {
		return findFirstLabel(node.child[0]);
	}
	return null;
};

export const interpret = (node, last, parentNext = null) => {
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

*/
