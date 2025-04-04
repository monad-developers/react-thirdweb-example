// Hooks
import { useActiveAccount } from "thirdweb/react";

export default function SignMessageButton() {

    const account = useActiveAccount();
    
    const handleSignTransaction = async () => {

        if (!account) {
            alert("Cannot detect wallet.");
            return;
        }

        try {            
            console.log("Signing message!");
            const startTime = Date.now();

            // This works!
            const signature = await account.signMessage({message: "Hello" });

            console.log(`Signed message: ${signature}`)
            console.log(`Processed transaction in ${Date.now() - startTime} ms`);
        
        } catch(err) {
            console.log("Error signing transaction: ", err)
            alert(`Problem signing txs`);
        }
    };

    return (
        <div>
            <button onClick={handleSignTransaction}>Call signMessage</button>
            <p>Open console for results!</p>
        </div>
    )
}