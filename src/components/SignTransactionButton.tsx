// Hooks
import { useActiveAccount } from "thirdweb/react";

// Utils
import { monadTestnet } from "../utils/chain";
import { signTransaction } from "thirdweb";


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
            const signature = await account.signTransaction!({
                chainId: monadTestnet.id,
                to: account.address,
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