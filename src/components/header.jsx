import React from "react";
import WalletButton from "./WalletButton";

function Header() {
  return (
    <div className="fixed top-0 right-0 dark:bg-[#242424] left-0 flex justify-end p-3">
      <WalletButton />
    </div>
  );
}

export default Header;
