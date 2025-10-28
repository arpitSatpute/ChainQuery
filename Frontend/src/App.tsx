import { Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import Pools from "@/pages/Pools";
import AboutPage from "@/pages/about";
import { WagmiProvider } from "wagmi";
import { config } from "./config/config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Airdrop from "@/pages/Airdrop";
import Vault from "@/pages/Vault";
import { ThirdwebProvider } from "thirdweb/react";
// import { client } from "./config/ThirdWeb";

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <ThirdwebProvider>
        <QueryClientProvider client={queryClient}>
          <Routes>
            <Route element={<IndexPage />} path="/" />
            <Route element={<Airdrop />} path="/airdrop" />
            <Route element={<Pools />} path="/pools" />
            <Route element={<Vault />} path="/vault" />
            <Route element={<AboutPage />} path="/about" />
          </Routes>
        </QueryClientProvider>
      </ThirdwebProvider>
    </WagmiProvider>
      
  );
}

export default App;
