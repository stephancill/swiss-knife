import { Box, Text, Code } from "@chakra-ui/react";

type ArgRendererProps = {
	value: unknown;
};

export function ArgRenderer({ value }: ArgRendererProps) {
	if (value === null || value === undefined) {
		return <Code colorScheme="gray">null</Code>;
	}

	if (typeof value === "bigint") {
		return <Code colorScheme="blue">{value.toString()}</Code>;
	}

	if (typeof value === "number") {
		return <Code colorScheme="purple">{value}</Code>;
	}

	if (typeof value === "boolean") {
		return (
			<Code colorScheme={value ? "green" : "red"}>
				{value ? "true" : "false"}
			</Code>
		);
	}

	if (typeof value === "string") {
		if (value.startsWith("0x") && value.length === 42) {
			// Likely an address
			return <Code colorScheme="cyan">{value}</Code>;
		}
		if (value.startsWith("0x")) {
			// Likely bytes
			return (
				<Code
					colorScheme="orange"
					wordBreak="break-all"
					display="block"
					mt={1}
				>
					{value}
				</Code>
			);
		}
		return <Code colorScheme="gray">"{value}"</Code>;
	}

	if (Array.isArray(value)) {
		return (
			<Box
				p={2}
				borderLeft="2px solid"
				borderColor="gray.600"
				bg="gray.800"
				mt={2}
			>
				<Text color="gray.400" fontSize="sm" mb={1}>
					Array [{value.length}]
				</Text>
				<Box display="flex" flexDirection="column" gap={1}>
					{value.map((item, index) => (
						<Box key={index} ml={2}>
							<Text color="gray.500" fontSize="xs">
								[{index}]:
							</Text>
							<ArgRenderer value={item} />
						</Box>
					))}
				</Box>
			</Box>
		);
	}

	if (typeof value === "object") {
		const entries = Object.entries(value as Record<string, unknown>);
		return (
			<Box
				p={2}
				borderLeft="2px solid"
				borderColor="gray.600"
				bg="gray.800"
				mt={2}
			>
				<Text color="gray.400" fontSize="sm" mb={1}>
					Object
				</Text>
				<Box display="flex" flexDirection="column" gap={1}>
					{entries.map(([key, val]) => (
						<Box key={key} ml={2}>
							<Text color="gray.500" fontSize="xs">
								{key}:
							</Text>
							<ArgRenderer value={val} />
						</Box>
					))}
				</Box>
			</Box>
		);
	}

	return <Code colorScheme="gray">{String(value)}</Code>;
}
