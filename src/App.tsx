import LoginButton from './components/LoginButton'
import SignMessageButton from './components/SignMessage'
import SignTransactionButton from './components/SignTransactionButton'
import SendTransactionButton from './components/SendTransactionButton'
import BatchSignTransactionButton from './components/BatchSignTransaction'
import BatchSendTransactionButton from './components/BatchSendTransaction'

function App() {

  return (
    <>
      <LoginButton />
      <SignMessageButton />
      <SignTransactionButton />
      <SendTransactionButton />
      <BatchSignTransactionButton />
      <BatchSendTransactionButton />
    </>
  )
}

export default App
