import { Div } from "@jumbo/shared";
import { Button, Typography } from "@mui/material";

const Footer = () => {
  return (
    <Div
      sx={{
        py: 2,
        px: { lg: 6, xs: 4 },
        borderTop: 2,
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Div
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant={"body1"} color={"text.primary"}>
          Copyright ThreeArrows © 2025
        </Typography>
        
      </Div>
    </Div>
  );
};

export { Footer };
