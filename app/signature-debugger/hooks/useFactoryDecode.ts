import { useQuery } from "@tanstack/react-query";
import {
	decodeFunctionData,
	type Abi,
	decodeAbiParameters,
	type Hex,
	isHex,
} from "viem";
import { decodeABIEncodedData } from "@/lib/decoder";
import { decodeWithSelector } from "@/lib/decoder";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Provider = any;

async function enrichArgs(
	args: unknown[],
	client: Provider,
): Promise<unknown[]> {
	return Promise.all(
		args.map(async (arg) => {
			if (Array.isArray(arg)) {
				return enrichArgs(arg, client);
			}
			if (arg && typeof arg === "object") {
				const obj = arg as Record<string, unknown>;
				const target = obj.target || obj.to;
				const data = obj.callData || obj.data;

				if (
					target &&
					typeof target === "string" &&
					data &&
					typeof data === "string" &&
					isHex(data) &&
					data !== "0x"
				) {
					try {
						// Use Swiss-knife's decoder instead of WhatsABI
						const decodedInner =
							await decodeWithSelector({ calldata: data });
						if (decodedInner) {
							return { ...obj, decodedCall: decodedInner };
						}
					} catch (e) {
						console.log("Inner decode failed", e);
					}
				}
			}
			return arg;
		}),
	);
}

export function useFactoryDecode(
	create2Factory: string | undefined,
	factoryCalldata: string | undefined,
	client: Provider,
) {
	return useQuery({
		queryKey: ["decodeFactory", create2Factory, factoryCalldata],
		queryFn: async () => {
			if (!create2Factory || !factoryCalldata)
				return null;

			try {
				// Use Swiss-knife's decoder instead of WhatsABI
				const result = await decodeABIEncodedData({
					calldata: factoryCalldata as Hex,
				});

				if (result) {
					const decoded = decodeFunctionData({
						abi: [result.fragment] as Abi,
						data: factoryCalldata as Hex,
					});

					if (decoded.args) {
						const args = await enrichArgs(
							decoded.args as unknown[],
							client,
						);
						return { ...decoded, args };
					}

					return decoded;
				}

				return null;
			} catch (e) {
				console.error("Factory decode error:", e);
				throw e;
			}
		},
		enabled: !!create2Factory && !!factoryCalldata,
		retry: false,
	});
}
