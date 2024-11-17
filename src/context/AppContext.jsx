import React, { createContext, useState, useContext } from "react";

export const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [account, setAccount] = React.useState("0x4Bb246e8FC52CBFf7a0FD5a298367E4718773395");
  const [loading, setLoading] = React.useState(false);
  const [redAlert, setRedAlert] = React.useState("");
  const [alert, setAlert] = React.useState("");
  return (
    <AppContext.Provider value={{ account, setAccount, loading, setLoading, redAlert, setRedAlert,alert, setAlert }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
