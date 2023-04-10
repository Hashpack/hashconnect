import { AppBar, Box, Link, Toolbar, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { HashConnectPairingsButton } from "../hashconnect/hashconnect-client";

export const Navbar = () => {
  return (
    <AppBar position="sticky" color="secondary">
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          <Link color="inherit" underline="hover" to="/" component={RouterLink}>
            Example Wallet
          </Link>
        </Typography>

        <Box ml="auto">
          <HashConnectPairingsButton />
        </Box>
      </Toolbar>
    </AppBar>
  );
};
