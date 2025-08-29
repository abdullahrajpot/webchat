import { AuthUserPopover } from "@app/_components/popovers/AuthUserPopover";
import { MessagesPopover } from "@app/_components/popovers/MessagesPopover";
import { NotificationsPopover } from "@app/_components/popovers/NotificationsPopover";
import { useJumboLayout, useSidebarState } from "@jumbo/components/JumboLayout/hooks";
import { useJumboTheme } from "@jumbo/components/JumboTheme/hooks";
import { SIDEBAR_STYLES } from "@jumbo/utilities/constants";
import { Box, Stack, useMediaQuery, AppBar, Toolbar, Button, Container } from "@mui/material";
import React from "react";
import {  SearchIconButtonOnSmallScreen } from "./components/SearchIconButtonOnSmallScreen";
import { TranslationPopover } from "@app/_components/popovers/TranslationPopover";
import { ThemeModeOption } from "./components/ThemeModeOptions";
import { Logo, SidebarToggleButton } from "@app/_components/_core";
import { Search } from "./components/Search";
import {Link} from 'react-router-dom'

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
    { name: "Dashboard", path: "/userdashboard" },
    { name: "Chat", path: "/chat" },
    { name: "About", path: "/about" },
  ];

  return (
    <AppBar 
      position="fixed" // Changed from 'static' to 'fixed'
      elevation={0}
      sx={{
        width: '100%',
        left: 0,
        right: 0,
        backgroundColor: 'background.paper',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider',
        py: { xs: 0.5, sm: 1 },
        zIndex: theme.zIndex.drawer + 1 // Ensure it stays above other content
      }}
    >
      <Container 
        maxWidth={false} // Remove maxWidth constraint
        sx={{
          px: { xs: 2, sm: 3, md: 4 }, // Add responsive padding
          width: '100%'
        }}
      >
        <Toolbar disableGutters sx={{ width: '100%', minHeight: { xs: 56, sm: 64 } }}>
          {/* Left Section - Logo and Navigation */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, gap: { xs: 2, md: 4 } }}>
            <Logo />
            
            {isSidebarStyle(SIDEBAR_STYLES.CLIPPED_UNDER_HEADER) && !isBelowLg && (
              <SidebarToggleButton />
            )}

            {/* Navigation Links */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, ml: { md: 2, lg: 4 }, gap: { md: 2, lg: 4 } }}>
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  style={{ textDecoration: 'none' }}
                  sx={{
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
                </Link>
              ))}
            </Box>
          </Box>

          {/* Center Section - Search */}
          <Box sx={{ 
            flexGrow: 1, 
            display: 'flex', 
            justifyContent: 'center',
            mx: { xs: 1, sm: 2 }
          }}>
            <Search show={searchVisibility} onClose={handleSearchVisibility} />
            <SearchIconButtonOnSmallScreen onClick={handleSearchVisibility} />
          </Box>

          {/* Right Section - Icons and User */}
          <Stack direction="row" spacing={{ xs: 1, sm: 1.5 }} alignItems="center" gap={{ xs: 1, sm: 2 }}>
            <ThemeModeOption />
            <TranslationPopover />
            <AuthUserPopover />
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export { Header2 };