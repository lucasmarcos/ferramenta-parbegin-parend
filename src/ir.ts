export const parse = (tree) => {
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

	return ir;
};
