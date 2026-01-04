import { useMemo } from "react";
import { Box, Code, Text } from "@chakra-ui/react";

type Decoded6492Signature = {
	create2Factory: string;
	factoryCalldata: string;
	originalERC1271Signature: string;
};

type DecodedFactoryData = {
	functionName: string;
	args?: readonly unknown[];
} | null;

type DecodedSignatureProps = {
	decodedSignature: Decoded6492Signature;
	decodedFactoryData: DecodedFactoryData;
	factoryDecodeError: Error | null;
	smartWalletSignature: import("./SmartWalletSignature").SmartWalletSignatureData | null;
	webAuthn: import("./WebAuthnDisplay").WebAuthnData | null;
};

import { formatArg } from "../utils/formatArg";
import { ArgRenderer } from "./ArgRenderer";
import { SmartWalletSignature } from "./SmartWalletSignature";

export function DecodedSignature({
	decodedSignature,
	decodedFactoryData,
	factoryDecodeError,
	smartWalletSignature,
	webAuthn,
}: DecodedSignatureProps) {
	return (
		<Box p={4} borderRadius="md" border="1px solid" borderColor="gray.600" bg="gray.900">
			<Text as="h3" mb={4}>
				Decoded ERC-6492 Signature
			</Text>

			<Box mb={4}>
				<Text color="gray.400" mb={1}>Create2 Factory</Text>
				<Code>{decodedSignature.create2Factory}</Code>
			</Box>

			<Box mb={4}>
				<Text color="gray.400" mb={1}>Factory Calldata</Text>
				<textarea
					readOnly
					value={decodedSignature.factoryCalldata}
					rows={3}
					style={{
						width: "100%",
						background: "gray.800",
						border: "1px solid gray.600",
						borderRadius: "4px",
						padding: "8px",
						color: "#aaccff",
						fontFamily: "monospace",
					}}
				/>
			</Box>

			{decodedFactoryData && (
				<Box
					ml={4}
					mb={4}
					p={4}
					borderLeft="2px solid"
					borderColor="gray.600"
					bg="gray.800"
				>
					<Text color="gray.400" mb={2}>
						Decoded Call:
					</Text>
					<Code
						display="block"
						mb={2}
						color="white"
						whiteSpace="pre-wrap"
					>
						{decodedFactoryData.functionName}(
						{decodedFactoryData.args?.map((arg: unknown, i: number) => (
							<span key={i}>
								{i > 0 && ", "}
								{typeof arg === "object" ? "..." : formatArg(arg)}
							</span>
						))}
						)
					</Code>

					{/* Show detailed args if available */}
					{decodedFactoryData.args && decodedFactoryData.args.length > 0 && (
						<Box mt={2} fontSize="sm">
							{decodedFactoryData.args.map((arg: unknown, i: number) => (
								<Box
									key={i}
									display="flex"
									gap={2}
									mt={1}
									flexDirection="column"
								>
									<Text color="gray.500">arg[{i}]:</Text>
									<ArgRenderer value={arg} />
								</Box>
							))}
						</Box>
					)}
				</Box>
			)}
			{factoryDecodeError && (
				<Text color="red.400" fontSize="sm" mb={4}>
					Could not decode factory data: {factoryDecodeError.message}
				</Text>
			)}

			<Box mb={4}>
				<Text color="gray.400" mb={1}>Original Signature</Text>
				<textarea
					readOnly
					value={decodedSignature.originalERC1271Signature}
					rows={4}
					style={{
						width: "100%",
						background: "gray.800",
						border: "1px solid gray.600",
						borderRadius: "4px",
						padding: "8px",
						color: "#aaccff",
						fontFamily: "monospace",
					}}
				/>
			</Box>

			{smartWalletSignature && (
				<Box ml={4} mb={4}>
					<SmartWalletSignature
						signature={smartWalletSignature}
						webAuthn={webAuthn}
					/>
				</Box>
			)}
		</Box>
	);
}
