// Hooks
import { prepareTransaction, sendTransaction } from "thirdweb";
import { useActiveAccount } from "thirdweb/react";

// Utils
import { client } from "../utils/client";
import { monadTestnet } from "../utils/chain";

export default function SignTransactionButton() {

    const account = useActiveAccount();
    
    const handleSendTransaction = async () => {

        if (!account) {
            alert("Cannot detect wallet.");
            return;
        }
        const startTime = Date.now();

        try {
            console.log("Sending transaction!");

            // This works!
            // const txHash = await sendTransaction({
            //     account,
            //     transaction: prepareTransaction({
            //         to: account.address,
            //         chain: monadTestnet,
            //         client,
            //     })
            // })

            // This fails! (https://embedded-wallet.thirdweb.com/api/v1/enclave-wallet/sign-transaction 400 (Bad Request))
            const txHash = await account.sendTransaction({
                chainId: monadTestnet.id,
                to: account.address,
            })
            console.log(`Sent transaction: ${txHash}`)
            console.log(`Processed transaction in ${Date.now() - startTime} ms`);
        
        } catch(err) {
            console.log("Error sending transaction: ", err)
            alert(`Problem sending txs`);
        }
    };

    return (
        <div>
            <button onClick={handleSendTransaction}>Call sendTransaction</button>
            <p>Open console for results!</p>
        </div>
    )
}