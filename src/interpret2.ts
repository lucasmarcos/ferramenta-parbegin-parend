export const interpret = (stack) => {
	const elements = [];

	const process = (node, dependsOn = []) => {
		if (!node) return [];

		switch (node.type) {
			case "call":
				elements.push({ data: { id: node.id, label: node.label } });

				dependsOn.forEach((source) => {
					elements.push({ data: { source: source.id, target: node.id } });
				});

				return [node];

			case "seq":
				let currentDeps = [...dependsOn];

				if (Array.isArray(node.child)) {
					node.child.forEach((childNode) => {
						currentDeps = process(childNode, currentDeps);
					});
				}

				return currentDeps;

			case "par":
				let allOutputs = [];

				if (Array.isArray(node.child)) {
					node.child.forEach((branch) => {
						const branchOutputs = process(branch, dependsOn);
						allOutputs = [...allOutputs, ...branchOutputs];
					});
				}

				return allOutputs;

			default:
				return dependsOn;
		}
	};

	process(stack);

	return elements;
};
