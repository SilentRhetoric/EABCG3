import React from "react";
import { useConnectWallet } from "@txnlab/use-wallet";

export default function ConnectWallet() {
  const { providers, accounts, activeAccount } = useConnectWallet();

  // Use these properties to display connected accounts to users.
  // They are also return by the `useWallet` hook.
  
  // CONVERSION: Make this into a createEffect
  React.useEffect(() => {
    console.log("connected accounts", accounts);
    console.log("active account", activeAccount);
  });

  // Map through the providers.
  // Render account information and "connect", "set active", and "disconnect" buttons.
  // Finally, map through the `accounts` property to render a dropdown for each connected account.
  return (
    <div>
      {providers.map((provider) => (
        <div key={"provider-" + provider.id}>
          <h4>
            <img
              width={30}
              height={30}
              src={provider.icon}
              alt={provider.name}
            />
            {provider.name} {provider.isActive && "[active]"}
          </h4>
          <div>
            <button onClick={provider.connect} disabled={provider.isConnected}>
              Connect
            </button>
            <button
              onClick={provider.disconnect}
              disabled={!provider.isConnected}
            >
              Disonnect
            </button>
            <button
              onClick={provider.setActive}
              disabled={!provider.isConnected || provider.isActive}
            >
              Set Active
            </button>
            <div>
              {provider.isActive && provider.accounts.length && (
                <select
                  value={provider.activeAccount?.address}
                  onChange={(e) => provider.selectAccount(e.target.value)}
                >
                  {provider.accounts.map((account) => (
                    <option value={account.address}>{account.address}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
