// Hooks
import { useActiveAccount } from "thirdweb/react";

// Utils
import { client } from "../utils/client";
import { monadTestnet } from "../utils/chain";
import { rpcRequest } from "../utils/rpcRequest";
import { STRICT_COUNTER_ADDRESS } from "../utils/constants";

import { encodeFunctionData } from "viem";
import { estimateGas, eth_getTransactionCount, getContract, Hex, readContract, toSerializableTransaction, toUnits } from "thirdweb";
import { post } from "../utils/fetch";


export default function BatchSendTransactionButton() {

    const account = useActiveAccount();
    
    const handleSignTransaction = async () => {
        const batch = 25;
        console.log(`Processing a batch of ${batch} transactions!`);

        if (!account) {
            alert("Cannot detect wallet.");
            return;
        }

        try {            
            const nonce = await eth_getTransactionCount(rpcRequest, { address: account.address });
            console.log("Wallet nonce: ", nonce);
            
            const contract = getContract({
                client,
                chain: monadTestnet,
                address: STRICT_COUNTER_ADDRESS,
            })

            const currentNumber = await readContract({
                contract,
                method: {
                    "type": "function",
                    "name": "number",
                    "inputs": [],
                    "outputs": [
                        {
                            "name": "",
                            "type": "uint256",
                            "internalType": "uint256"
                        }
                    ],
                    "stateMutability": "view"
                }
            })
            console.log("Fetched current number on contract: ", currentNumber.toString());

            const tx0PreGas = {
                client,
                chain: monadTestnet,
                to: STRICT_COUNTER_ADDRESS,
                data: encodeFunctionData({
                    abi: [
                        {
                            "type": "function",
                            "name": "update",
                            "inputs": [
                                {
                                    "name": "newNumber",
                                    "type": "uint256",
                                    "internalType": "uint256"
                                }
                            ],
                            "outputs": [],
                            "stateMutability": "nonpayable"
                        }
                    ],
                    functionName: "update",
                    args: [currentNumber + BigInt(1)],
                }),
                gasPrice: toUnits("52", 9),
                nonce,
            }
            const gasEstimate = await estimateGas({ transaction: tx0PreGas });
            console.log("Estimated gas per tx: ", gasEstimate.toString());

            const tx0 = { ...tx0PreGas, gas: gasEstimate}

            console.log("Signing transactions!");
            const startTime = Date.now();

            const serializedTx0 = await toSerializableTransaction({
                transaction: tx0
            })
            const sig0 = await account.signTransaction!(serializedTx0)
            console.log(`Signed transaction 0`)

            const signedTxsPromises: Promise<Hex>[] = Array(batch).fill("0x").map(async (_, index) => {  
                if(index ==  0) {
                    return sig0;
                }
                const tx = await toSerializableTransaction({
                    transaction: {
                        client,
                        chain: monadTestnet,
                        to: STRICT_COUNTER_ADDRESS,
                        data: encodeFunctionData({
                            abi: [
                                {
                                    "type": "function",
                                    "name": "update",
                                    "inputs": [
                                        {
                                            "name": "newNumber",
                                            "type": "uint256",
                                            "internalType": "uint256"
                                        }
                                    ],
                                    "outputs": [],
                                    "stateMutability": "nonpayable"
                                }
                            ],
                            functionName: "update",
                            args: [currentNumber + BigInt(index + 1)]
                        }),
                        nonce: nonce + index,
                        gas: gasEstimate,
                        gasPrice: toUnits("52", 9)
                    }
                })
                const sig = await account.signTransaction!(tx)
                console.log(`Signed transaction ${index}`)

                return sig;
            })
            const signedTxs: Hex[] = await Promise.all(signedTxsPromises);
            console.log(`Signed transactions in ${Date.now() - startTime} ms`);

            const params = signedTxs.map((tx, index) => {
                return {
                    jsonrpc: "2.0",
                    id: index,
                    method: "eth_sendRawTransaction",
                    params: [tx],
                }
            })
            console.log("RPC: ", monadTestnet.rpc)
            const result = await post({
                url: monadTestnet.rpc,
                params
            })

            console.log(`Sent transactions in ${Date.now() - startTime} ms`);
            console.log("Batched request response: ", result);
        
        } catch(err) {
            console.log("Error signing transaction: ", err)
            alert(`Problem signing txs`);
        }
    };

    return (
        <div>
            <button onClick={handleSignTransaction}>Batch send transactions</button>
            <p>Open console for results!</p>
        </div>
    )
}