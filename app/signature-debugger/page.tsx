"use client";

import { useState, useMemo } from "react";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import {
	Heading,
	Box,
	Text,
	FormControl,
	FormLabel,
	Input,
	Textarea,
	Select,
	SimpleGrid,
	Link,
} from "@chakra-ui/react";
import { Layout } from "@/components/Layout";
import { DecodedSignature } from "./components/DecodedSignature";
import { VerificationStatus } from "./components/VerificationStatus";
import { SmartWalletSignature } from "./components/SmartWalletSignature";
import { useFactoryDecode } from "./hooks/useFactoryDecode";
import { useMessageHash } from "./hooks/useMessageHash";
import { useMultiRpcVerification } from "./hooks/useMultiRpcVerification";
import { useSignatureDecoding } from "./hooks/useSignatureDecoding";
import { useVerificationCallData } from "./hooks/useVerificationCallData";
import { useVerifySignature } from "./hooks/useVerifySignature";
import { chains, getChain } from "./utils/chains";

function SignatureDebugger() {
	const [message, setMessage] = useState("");
	const [signature, setSignature] = useState("");
	const [address, setAddress] = useState("");
	const [chainId, setChainId] = useState(1);

	const { messageHash, isTypedData, typedDataError, typedData, rawMessage } =
		useMessageHash(message);

	const { decodedSignature, decodedSmartWalletSignature, decodedWebAuthn } =
		useSignatureDecoding(signature);

	const client = useMemo(() => {
		return createPublicClient({
			chain: getChain(chainId) || mainnet,
			transport: http(),
		});
	}, [chainId]);

	const { data: decodedFactoryData, error: factoryDecodeError } =
		useFactoryDecode(
			decodedSignature?.create2Factory,
			decodedSignature?.factoryCalldata,
			client,
		);

	const {
		data: verificationResult,
		isPending: isVerifying,
		error: verificationError,
	} = useVerifySignature({
		address,
		signature,
		message,
		isTypedData,
		typedData,
		typedDataError,
		rawMessage,
		client,
	});

	const { results: multiRpcResults, isMainnet } = useMultiRpcVerification({
		address,
		signature,
		message,
		isTypedData,
		typedData,
		typedDataError,
		rawMessage,
		chainId,
	});

	const verificationCallData = useVerificationCallData(
		decodedSignature,
		address,
		signature,
		messageHash,
		chainId,
	);

	return (
		<Layout>
			<Box minH="50vh">
				<Heading mb={2}>Signature Debugger</Heading>
				<Text color="gray.400" mb={6}>
					Debug and verify ERC-6492 signatures for counterfactual smart
					wallets
				</Text>

				<SimpleGrid columns={{ base: 1, md: 2 }} gap={4} mb={4}>
					<FormControl>
						<FormLabel>Chain ID</FormLabel>
						<Select
							value={chainId}
							onChange={(e) => setChainId(Number(e.target.value))}
						>
							{chains.map((chain) => (
								<option key={chain.id} value={chain.id}>
									{chain.name} ({chain.id})
								</option>
							))}
						</Select>
					</FormControl>

					<FormControl>
						<FormLabel>Signer Address</FormLabel>
						<Input
							value={address}
							onChange={(e) => setAddress(e.target.value)}
							placeholder="0x..."
							fontFamily="monospace"
						/>
					</FormControl>
				</SimpleGrid>

				<FormControl mb={4}>
					<FormLabel>
						Message / Typed Data (JSON)
						{isTypedData && (
							<Text
								as="span"
								ml={2}
								py={1}
								px={2}
								bg="blue.500"
								color="white"
								fontSize="xs"
								borderRadius="md"
							>
								Typed Data Detected
							</Text>
						)}
					</FormLabel>
					<Textarea
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						placeholder="Enter text message or JSON Typed Data..."
						rows={8}
						fontFamily="monospace"
					/>
					{typedDataError && (
						<Text color="red.400" mt={2}>
							{typedDataError}
						</Text>
					)}
					{messageHash && (
						<Text mt={2} fontSize="sm">
							<Text as="span" color="gray.500" mr={2}>
								Message Hash:
							</Text>
							<Code colorScheme="yellow">{messageHash}</Code>
						</Text>
					)}
				</FormControl>

				<FormControl mb={6}>
					<FormLabel>Signature</FormLabel>
					<Textarea
						value={signature}
						onChange={(e) => setSignature(e.target.value)}
						placeholder="0x..."
						rows={4}
						fontFamily="monospace"
					/>
				</FormControl>

				{/* Verification Result */}
				{address && signature && message && (
					<VerificationStatus
						isVerifying={isVerifying}
						verificationError={verificationError as Error | null}
						verificationResult={verificationResult}
						chainId={chainId}
						verificationCallData={verificationCallData}
						multiRpcResults={multiRpcResults}
						isMainnet={isMainnet}
					/>
				)}

				{decodedSignature ? (
					<DecodedSignature
						decodedSignature={decodedSignature}
						decodedFactoryData={decodedFactoryData ?? null}
						factoryDecodeError={factoryDecodeError as Error | null}
						smartWalletSignature={decodedSmartWalletSignature}
						webAuthn={decodedWebAuthn}
					/>
				) : (
					signature && (
						<Box
							p={4}
							borderRadius="md"
							border="1px solid"
							borderColor="gray.600"
							bg="gray.900"
							mb={4}
						>
							<Text as="h3" mb={3}>
								Signature Analysis
							</Text>
							<Text color="gray.500" mb={4}>
								Not an ERC-6492 signature (Magic Bytes not found).
							</Text>

							{decodedSmartWalletSignature && (
								<SmartWalletSignature
									signature={decodedSmartWalletSignature}
									webAuthn={decodedWebAuthn}
								/>
							)}
						</Box>
					)
				)}
			</Box>
		</Layout>
	);
}

export default SignatureDebugger;
