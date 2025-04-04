// Hooks
import { useActiveAccount } from "thirdweb/react";

// Utils
import { client } from "../utils/client";
import { monadTestnet } from "../utils/chain";
import { rpcRequest } from "../utils/rpcRequest";
import { STRICT_COUNTER_ADDRESS } from "../utils/constants";

import { encodeFunctionData } from "viem";
import { eth_getTransactionCount, getContract, Hex, readContract, toSerializableTransaction, toUnits } from "thirdweb";


export default function BatchSignTransactionButton() {

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

            console.log("Signing transactions!");
            const startTime = Date.now();

            const tx0 = await toSerializableTransaction({
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
                        args: [currentNumber + BigInt(1)]
                    }),
                    gas: BigInt(21000),
                    gasPrice: toUnits("52", 9)
                }
            })
            const sig0 = await account.signTransaction!(tx0)
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
                        gas: BigInt(21000),
                        gasPrice: toUnits("52", 9)
                    }
                })
                const sig = await account.signTransaction!(tx)
                console.log(`Signed transaction ${index}`)

                return sig;
            })
            const signedTxs: Hex[] = await Promise.all(signedTxsPromises);
            console.log(`Processed transactions in ${Date.now() - startTime} ms`);

            console.log(signedTxs);
        
        } catch(err) {
            console.log("Error signing transaction: ", err)
            alert(`Problem signing txs`);
        }
    };

    return (
        <div>
            <button onClick={handleSignTransaction}>Batch sign transactions</button>
            <p>Open console for results!</p>
        </div>
    )
}