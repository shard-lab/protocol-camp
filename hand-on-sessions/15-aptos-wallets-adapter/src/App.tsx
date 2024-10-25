import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { WalletConnector } from "@aptos-labs/wallet-adapter-mui-design";
import { Button, TextField, Typography, Container, Box } from "@mui/material";

function App() {
  return (
    <Container
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        textAlign: "center",
      }}
    >
      <Box>
        <Typography variant="h4" gutterBottom>
          Aptos Wallet
        </Typography>
        <WalletConnector networkSupport="" />
        <Typography variant="body1" sx={{ marginTop: 2 }}>
          Connect to your Aptos wallet to see your balance and transfer APT.
        </Typography>
      </Box>
    </Container>
  );
}

export default App;
