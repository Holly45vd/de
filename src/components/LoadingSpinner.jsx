// src/components/LoadingSpinner.jsx
import { Box, CircularProgress } from "@mui/material";

export default function LoadingSpinner() {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="60vh"
    >
      <CircularProgress />
    </Box>
  );
}
