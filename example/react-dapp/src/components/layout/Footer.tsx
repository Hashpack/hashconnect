import { AppBar, Toolbar, Typography } from "@mui/material";

export const Footer = () => {
  return (
    <AppBar position="relative" color="secondary">
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Example footer
        </Typography>
      </Toolbar>
    </AppBar>
  );
};
