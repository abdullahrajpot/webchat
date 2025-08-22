import { AuthUserPopover } from "@app/_components/popovers/AuthUserPopover";
import { MessagesPopover } from "@app/_components/popovers/MessagesPopover";
import { NotificationsPopover } from "@app/_components/popovers/NotificationsPopover";
import { useJumboLayout, useSidebarState } from "@jumbo/components/JumboLayout/hooks";
import { useJumboTheme } from "@jumbo/components/JumboTheme/hooks";
import { SIDEBAR_STYLES } from "@jumbo/utilities/constants";
import { Box, Stack, useMediaQuery, AppBar, Toolbar, Button, Container } from "@mui/material";
import React from "react";
import { Search, SearchIconButtonOnSmallScreen } from "./components/Search";
import { TranslationPopover } from "@app/_components/popovers/TranslationPopover";
import { ThemeModeOption } from "./components/ThemeModeOptions";
import { Logo, SidebarToggleButton } from "@app/_components/_core";

function Header2() {
  const { isSidebarStyle } = useSidebarState();
  const [searchVisibility, setSearchVisibility] = React.useState(false);
  const { headerOptions } = useJumboLayout();
  const { theme } = useJumboTheme();
  const isBelowLg = useMediaQuery(
    theme.breakpoints.down(headerOptions?.drawerBreakpoint ?? "xl")
  );

  const handleSearchVisibility = React.useCallback((value) => {
    setSearchVisibility(value);
  }, []);

  // Navigation links
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    { name: "Services", path: "/services" },
    { name: "About", path: "/about" },
  ];

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{
        width: '100%',
        backgroundColor: 'background.paper',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider',
        py: 1
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Left Section - Logo and Navigation */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Logo />
            
            {isSidebarStyle(SIDEBAR_STYLES.CLIPPED_UNDER_HEADER) && !isBelowLg && (
              <SidebarToggleButton />
            )}

            {/* Navigation Links */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, ml: 4 }}>
              {navLinks.map((link) => (
                <Button
                  key={link.name}
                  href={link.path}
                  sx={{
                    mx: 1,
                    color: 'text.primary',
                    textTransform: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      color: 'primary.main',
                      backgroundColor: 'transparent'
                    }
                  }}
                >
                  {link.name}
                </Button>
              ))}
            </Box>
          </Box>

          {/* Center Section - Search */}
          <Box sx={{ 
            flexGrow: 1, 
            display: 'flex', 
            justifyContent: 'center',
            mx: 2
          }}>
            <Search show={searchVisibility} onClose={handleSearchVisibility} />
            <SearchIconButtonOnSmallScreen onClick={handleSearchVisibility} />
          </Box>

          {/* Right Section - Icons and User */}
          <Stack direction="row" spacing={1} alignItems="center">
            <ThemeModeOption />
            <TranslationPopover />
            <MessagesPopover />
            <NotificationsPopover />
            <AuthUserPopover />
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export { Header2 };