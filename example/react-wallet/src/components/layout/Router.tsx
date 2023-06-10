import { Box, Stack, useTheme } from "@mui/material";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "../../pages/Home";
import { Footer } from "./Footer";
import { Layout } from "./Layout";
import { Navbar } from "./Navbar";

export const Router = () => {
  const theme = useTheme();

  return (
    <BrowserRouter>
      <Stack minHeight="100vh">
        <Navbar />
        <Box flex={1} bgcolor={theme.palette.primary.main}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
            </Route>
          </Routes>
        </Box>
        <Footer />
      </Stack>
    </BrowserRouter>
  );
};
