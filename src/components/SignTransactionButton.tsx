// Hooks
import { useActiveAccount } from "thirdweb/react";

// Utils
import { toUnits } from "thirdweb";
import { monadTestnet } from "../utils/chain";

export default function SignTransactionButton() {

    const account = useActiveAccount();
    
    const handleSignTransaction = async () => {

        if (!account) {
            alert("Cannot detect wallet.");
            return;
        }
        const startTime = Date.now();

        try {            
            console.log("Signing transaction!");
            
            // This fails! (https://embedded-wallet.thirdweb.com/api/v1/enclave-wallet/sign-transaction 400 (Bad Request))
            // You need to pass `gas` and `gasPrice` even though the SDK doesn't complain when you don't pass them.
            //
            // const signature = await account.signTransaction!({
            //     chainId: monadTestnet.id,
            //     to: account.address,
            // })

            // This works!
            const signature = await account.signTransaction!({
                chainId: monadTestnet.id,
                to: account.address,
                gas: BigInt(21000),
                gasPrice: toUnits("52", 9)
            })

            console.log(`Signed transaction: ${signature}`)
            console.log(`Processed transaction in ${Date.now() - startTime} ms`);
        
        } catch(err) {
            console.log("Error signing transaction: ", err)
            alert(`Problem signing txs`);
        }
    };

    return (
        <div>
            <button onClick={handleSignTransaction}>Call signTransaction</button>
            <p>Open console for results!</p>
        </div>
    )
}