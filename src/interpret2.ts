export const interpret = (node) => {
	const calls = [];

	if (node.label) {
		calls.push({ data: { id: node.label } });
	}

	if (node.child) {
		for (const c of node.child) {
			calls.push(...interpret(c));
		}
	}

	return calls;
};
