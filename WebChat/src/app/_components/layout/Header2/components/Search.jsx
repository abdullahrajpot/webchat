import { SearchGlobal } from "@app/_components/_core";
import { useSmallScreen } from "@app/_hooks";
import { Div } from "@jumbo/shared";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton, Slide, InputAdornment, TextField, Box } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PropTypes from "prop-types";

function Search(props) {
  const smallScreen = useSmallScreen();
  const { show, onClose } = props;

  if (!smallScreen) {
    return (
      <Box sx={{ width: '100%', maxWidth: 500 }}>
        <TextField
          fullWidth
          placeholder="Search anything..."
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            sx: {
              backgroundColor: 'background.paper',
              borderRadius: '24px',
            }
          }}
        />
      </Box>
    );
  }

  return (
    <Slide direction="down" in={show} mountOnEnter unmountOnExit>
      <Div
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1,
          height: "100%",
          display: "flex",
          alignItems: "center",
          px: 2,
          backgroundColor: 'background.default',
        }}
      >
        <TextField
          fullWidth
          placeholder="Search anything..."
          variant="outlined"
          size="small"
          autoFocus
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            sx: {
              backgroundColor: 'background.paper',
              borderRadius: '24px',
            },
          }}
        />
        <IconButton onClick={() => onClose(false)} sx={{ ml: 1 }}>
          <CloseIcon />
        </IconButton>
      </Div>
    </Slide>
  );
}

export { Search };

Search.propTypes = {
  show: PropTypes.bool,
  onClose: PropTypes.func,
};