import { TransactionResponse } from "@ethersproject/abstract-provider";
export declare function sendTransaction({ to, data, gasLimit, network }: {
    to: string;
    data: string;
    gasLimit: number;
    network: string;
}): Promise<TransactionResponse>;
export declare function getAllSignerAddresses(): Promise<{
    reinvestment: string;
    "liquidation-2": string;
}>;
