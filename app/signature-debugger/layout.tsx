import { getMetadata } from "@/utils";

export const metadata = getMetadata({
	title: "Signature Debugger | Swiss-Knife.xyz",
	description: "Debug ERC-6492 signatures for counterfactual smart wallets",
	images: "https://swiss-knife.xyz/og/signature-debugger.png",
});

const SignatureDebuggerLayout = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	return <>{children}</>;
};

export default SignatureDebuggerLayout;
