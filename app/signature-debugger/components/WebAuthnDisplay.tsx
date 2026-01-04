import type { Hex } from "viem";
import { Box, Text, Code } from "@chakra-ui/react";

export type WebAuthnData = {
	authenticatorData: Hex;
	clientDataJSON: string;
	parsedClientData: unknown;
	challengeIndex: bigint;
	typeIndex: bigint;
	r: bigint;
	s: bigint;
};

export function WebAuthnDisplay({
	data,
}: {
	data: WebAuthnData;
}) {
	return (
		<Box
			mt={2}
			ml={4}
			pl={3}
			borderLeft="2px solid"
			borderColor="gray.600"
		>
			<Text color="gray.500" mb={2}>
				Decoded WebAuthn:
			</Text>
			<Flex flexDirection="column" gap={2}>
				<div>
					<Text color="gray.500">authenticatorData: </Text>
					<Code
						colorScheme="blue"
						wordBreak="break-all"
						display="block"
						mt={1}
					>
						{data.authenticatorData}
					</Code>
				</div>
				<div>
					<Text color="gray.500">clientDataJSON: </Text>
					<Code
						colorScheme="blue"
						wordBreak="break-all"
						display="block"
						mt={1}
					>
						{data.parsedClientData
							? JSON.stringify(data.parsedClientData, null, 2)
							: data.clientDataJSON}
					</Code>
				</div>
				<div>
					<Text color="gray.500">challengeIndex: </Text>
					<Code colorScheme="blue">
						{data.challengeIndex.toString()}
					</Code>
				</div>
				<div>
					<Text color="gray.500">typeIndex: </Text>
					<Code colorScheme="blue">
						{data.typeIndex.toString()}
					</Code>
				</div>
				<div>
					<Text color="gray.500">r: </Text>
					<Code
						colorScheme="blue"
						wordBreak="break-all"
						display="block"
						mt={1}
					>
						0x{data.r.toString(16)}
					</Code>
				</div>
				<div>
					<Text color="gray.500">s: </Text>
					<Code
						colorScheme="blue"
						wordBreak="break-all"
						display="block"
						mt={1}
					>
						0x{data.s.toString(16)}
					</Code>
				</div>
			</Flex>
		</Box>
	);
}
