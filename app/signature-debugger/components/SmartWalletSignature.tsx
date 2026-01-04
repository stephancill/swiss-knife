export type SmartWalletSignatureData = {
	ownerIndex: bigint;
	signatureData: string;
};

type SmartWalletSignatureProps = {
	signature: SmartWalletSignatureData;
	webAuthn: import("./WebAuthnDisplay").WebAuthnData | null;
};

import type { WebAuthnData } from "./WebAuthnDisplay";
import { WebAuthnDisplay } from "./WebAuthnDisplay";
import { Box, Text, Code, Flex } from "@chakra-ui/react";

export function SmartWalletSignature({
	signature,
	webAuthn,
}: SmartWalletSignatureProps) {
	return (
		<Box
			p={4}
			borderLeft="2px solid"
			borderColor="gray.600"
			bg="gray.900"
		>
			<Text color="gray.400" mb={2}>
				Coinbase Smart Wallet Signature:
			</Text>
			<Flex flexDirection="column" gap={2}>
				<div>
					<Text color="gray.500">ownerIndex: </Text>
					<Code colorScheme="green">
						{signature.ownerIndex.toString()}
					</Code>
				</div>
				<div>
					<Text color="gray.500">signatureData: </Text>
					<Code
						colorScheme="blue"
						wordBreak="break-all"
						display="block"
						mt={1}
					>
						{signature.signatureData}
					</Code>
				</div>
				{webAuthn && <WebAuthnDisplay data={webAuthn} />}
			</Flex>
		</Box>
	);
}
