import { AppBar, Box, Link, Toolbar, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { HashConnectConnectButton } from "../hashconnect/hashconnect-client";

export const Navbar = () => {
  return (
    <AppBar position="sticky" color="secondary">
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          <Link color="inherit" underline="hover" to="/" component={RouterLink}>
            Example dApp
          </Link>
        </Typography>

        <Box ml="auto">
          <HashConnectConnectButton />
        </Box>
      </Toolbar>
    </AppBar>
  );
};
