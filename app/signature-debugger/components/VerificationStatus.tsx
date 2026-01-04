import { useState } from "react";
import type { RpcResult } from "../hooks/useMultiRpcVerification";
import type { VerificationCallData } from "../hooks/useVerificationCallData";
import { getChain } from "../utils/chains";
import {
	Box,
	Text,
	Badge,
	Button,
	Link,
	Center,
	Spinner,
	AlertDialog,
	AlertDialogBody,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogContent,
	AlertDialogOverlay,
	useDisclosure,
} from "@chakra-ui/react";
import { useRef } from "react";

type VerificationStatusProps = {
	isVerifying: boolean;
	verificationError: Error | null;
	verificationResult: boolean | null | undefined;
	chainId: number;
	verificationCallData: VerificationCallData | null;
	multiRpcResults?: RpcResult[];
	isMainnet?: boolean;
};

function RpcResultBadge({ result }: { result: RpcResult }) {
	if (result.isPending) {
		return (
			<Box
				display="flex"
				alignItems="center"
				justifyContent="space-between"
				p={2}
				bg="whiteAlpha.50"
				borderRadius="md"
				border="1px solid"
				borderColor="gray.600"
			>
				<Text color="gray.200">{result.name}</Text>
				<Text color="gray.500" fontSize="sm">
					⏳
				</Text>
			</Box>
		);
	}

	if (result.error) {
		return (
			<Box
				display="flex"
				alignItems="center"
				justifyContent="space-between"
				p={2}
				bg="yellowAlpha.100"
				borderRadius="md"
				border="1px solid"
				borderColor="yellow.400"
				title={result.error.message}
			>
				<Text color="gray.200">{result.name}</Text>
				<Text
					color="yellow.400"
					fontSize="sm"
					fontWeight="bold"
				>
					⚠️ ERROR
				</Text>
			</Box>
		);
	}

	const isValid = result.result === true;

	return (
		<Box
			display="flex"
			alignItems="center"
			justifyContent="space-between"
			p={2}
			bg={isValid ? "greenAlpha.100" : "redAlpha.100"}
			borderRadius="md"
			border="1px solid"
			borderColor={isValid ? "green.400" : "red.400"}
		>
			<Text color="gray.200">{result.name}</Text>
			<Text
				color={isValid ? "green.400" : "red.400"}
				fontSize="sm"
				fontWeight="bold"
			>
				{isValid ? "✓ VALID" : "✗ INVALID"}
			</Text>
		</Box>
	);
}

export function VerificationStatus({
	isVerifying,
	verificationError,
	verificationResult,
	chainId,
	verificationCallData,
	multiRpcResults,
	isMainnet,
}: VerificationStatusProps) {
	const [calldataExpanded, setCalldataExpanded] = useState(false);
	const { isOpen, onToggle } = useDisclosure();

	const isMulticall = verificationCallData?.type === "multicall";
	const calldataTitle = isMulticall
		? "Multicall3 Verification Calldata"
		: "isValidSignature Calldata";
	const calldataDescription = isMulticall
		? "Deploy + isValidSignature in a single call via Multicall3"
		: "Direct ERC-1271 isValidSignature call to the signer contract";
	const toLabel = isMulticall
		? "To (Multicall3)"
		: "To (Signer)";

	// Calculate overall status for mainnet multi-RPC
	const showMultiRpc =
		isMainnet && multiRpcResults && multiRpcResults.length > 0;
	const completedResults =
		multiRpcResults?.filter((r) => !r.isPending) ?? [];
	const successfulResults = completedResults.filter((r) => !r.error);
	const validCount = successfulResults.filter((r) => r.result === true)
		.length;
	const invalidCount = successfulResults.filter(
		(r) => r.result === false,
	).length;
	const errorCount = completedResults.filter((r) => r.error).length;
	const pendingCount =
		multiRpcResults?.filter((r) => r.isPending).length ?? 0;

	return (
		<Box
			p={6}
			borderRadius="lg"
			border="1px solid"
			borderColor="gray.600"
			bg="gray.900"
			mb={8}
		>
			<Text as="h3" mt={0} mb={4}>
				Verification Status
				{showMultiRpc && (
					<Text as="span" ml={3} fontSize="sm" color="gray.500" fontWeight="normal">
						(Multi-RPC on Mainnet)
					</Text>
				)}
			</Text>

			{showMultiRpc ? (
				<>
					{/* Summary */}
					<Box
						display="flex"
						flexWrap="wrap"
						gap={3}
						mb={4}
						p={3}
						bg="whiteAlpha.50"
						borderRadius="md"
					>
						{pendingCount > 0 && (
							<Text color="gray.500">⏳ {pendingCount} pending</Text>
						)}
						{validCount > 0 && (
							<Text color="green.400">✓ {validCount} valid</Text>
						)}
						{invalidCount > 0 && (
							<Text color="red.400">✗ {invalidCount} invalid</Text>
						)}
						{errorCount > 0 && (
							<Text color="yellow.400">⚠️ {errorCount} errors</Text>
						)}
					</Box>

					{/* Individual RPC Results */}
					<Box
						display="grid"
						gridTemplateColumns={{
							base: "repeat(auto-fill, minmax(200px, 1fr))",
						}}
						gap={2}
					>
						{multiRpcResults.map((result) => (
							<RpcResultBadge key={result.url} result={result} />
						))}
					</Box>
				</>
			) : isVerifying ? (
				<Center py={4}>
					<Spinner color="blue.400" />
					<Text ml={3} color="gray.400">
						Verifying signature on-chain...
					</Text>
				</Center>
			) : verificationError ? (
				<Text color="red.400">
					Error: {verificationError.message}
				</Text>
			) : (
				<Box display="flex" alignItems="center" gap={4}>
					<Badge
						colorScheme={verificationResult ? "green" : "red"}
						py={2}
						px={4}
						borderRadius="md"
						fontSize="md"
					>
						{verificationResult ? "VALID" : "INVALID"}
					</Badge>
					<Text color="gray.500">
						Verified on {getChain(chainId)?.name}
					</Text>
				</Box>
			)}

			{verificationCallData && (
				<Box
					mt={6}
					border="1px solid"
					borderColor="blue.400"
					borderRadius="lg"
					overflow="hidden"
				>
					<Button
						onClick={() => setCalldataExpanded(!calldataExpanded)}
						w="100%"
						bg="blueAlpha.100"
						_hover={{ bg: "blueAlpha.200" }}
						color="blue.400"
						fontSize="md"
						fontWeight={600}
						textAlign="left"
						border="none"
					>
						<span
							style={{
								display: "inline-block",
								transition: "transform 0.2s ease",
								transform: calldataExpanded
									? "rotate(90deg)"
									: "rotate(0deg)",
							}}
						>
							▶
						</span>
						{calldataTitle}
					</Button>
					{calldataExpanded && (
						<Box p={4} bg="blueAlpha.50">
							<Text
								fontSize="sm"
								color="gray.500"
								mb={3}
							>
								{calldataDescription}
							</Text>
							<Box mb={3}>
								<Text color="gray.400" mb={1}>{toLabel}</Text>
								<Code>{verificationCallData.to}</Code>
							</Box>
							<Box mb={4}>
								<Text color="gray.400" mb={1}>Calldata</Text>
								<textarea
									readOnly
									value={verificationCallData.data}
									rows={4}
									onClick={(e) =>
										(e.target as HTMLTextAreaElement).select()
									}
									style={{
										width: "100%",
										background: "gray.800",
										border: "1px solid gray.600",
										borderRadius: "4px",
										padding: "8px",
										color: "#aaccff",
										fontFamily: "monospace",
										cursor: "pointer",
									}}
								/>
							</Box>
							<Box mt={4}>
								<Link
									href={verificationCallData.tenderlyUrl}
									target="_blank"
									rel="noopener noreferrer"
									display="inline-flex"
									alignItems="center"
									gap={2}
									p={2}
									bg="blueAlpha.200"
									borderRadius="md"
									textDecoration="none"
									_hover={{ textDecoration: "none", bg: "blueAlpha.300" }}
								>
									Simulate on Tenderly ↗
								</Link>
							</Box>
							<Text
								fontSize="xs"
								color="gray.500"
								mt={3}
								fontFamily="monospace"
							>
								Valid if:{" "}
								<Code colorScheme="yellow">result == 0x1626ba7e</Code>
							</Text>
						</Box>
					)}
				</Box>
			)}
		</Box>
	);
}
