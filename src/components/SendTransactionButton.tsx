// Hooks
import { useActiveAccount } from "thirdweb/react";

// Utils
import { toUnits } from "thirdweb";
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

            // This fails! (https://embedded-wallet.thirdweb.com/api/v1/enclave-wallet/sign-transaction 400 (Bad Request))
            // You need to pass `gas` and `gasPrice` even though the SDK doesn't complain when you don't pass them.
            //
            // const txHash = await account.sendTransaction({
            //     chainId: monadTestnet.id,
            //     to: account.address,
            // })

            // This works!
            const txHash = await account.sendTransaction({
                chainId: monadTestnet.id,
                to: account.address,
                gas: BigInt(21000),
                gasPrice: toUnits("70", 9)
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