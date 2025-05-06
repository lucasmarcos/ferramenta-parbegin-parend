export const stackify = (ir) => {
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

	return current[0];
};
