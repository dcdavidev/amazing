import '@fontsource-variable/inter';

import React from 'react';

import {
  isRouteErrorResponse,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router';

import {
  Alert,
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';

import './app.css';

import type { Route } from './+types/root';
import { LoadingScreen } from './components/LoadingScreen';
import { theme } from './configs/theme';
import { withDatabaseHealth } from './hoc/with-database-health';

export const links: Route.LinksFunction = () => [
  {
    rel: 'icon',
    type: 'image/png',
    href: '/favicon-96x96.png',
    sizes: '96x96',
  },
  {
    rel: 'icon',
    type: 'image/svg+xml',
    href: '/favicon.svg',
  },
  {
    rel: 'shortcut icon',
    href: '/favicon.ico',
  },
  {
    rel: 'apple-touch-icon',
    sizes: '180x180',
    href: '/apple-touch-icon.png',
  },
  {
    rel: 'manifest',
    href: '/site.webmanifest',
  },
];

export const meta: Route.MetaFunction = () => [
  { title: 'Amazing Shop' },
  { name: 'description', content: 'Amazing Shop' },
  { name: 'apple-mobile-web-app-title', content: 'Amazing' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, user-scalable=no"
        />
        <Meta />
        <Links />
      </head>
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function HydrateFallback() {
  return <LoadingScreen />;
}

function App() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="sticky" color="primary" elevation={1}>
        <Toolbar>
          <NavLink to="/">
            <Avatar alt="Amazing" src="/logo/square.png" />
          </NavLink>
          <Typography variant="h6" component="div" sx={{ ml: 2, flexGrow: 1 }}>
            Amazing Shop
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ my: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
}

export default withDatabaseHealth(App);

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const is404 = isRouteErrorResponse(error) && error.status === 404;

  let title = 'Si è verificato un errore';
  let badge = 'Errore';
  let details = 'Si è verificato un errore imprevisto durante la navigazione.';
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      title = 'Pagina non trovata';
      badge = '404';
      details =
        'La risorsa o la pagina che stai cercando non esiste o è stata spostata.';
    } else {
      title = `Errore ${error.status}`;
      badge = `HTTP ${error.status}`;
      details =
        error.statusText || 'Si è verificato un errore durante la richiesta.';
    }
  } else if (error instanceof Error) {
    title = 'Si è verificato un errore imprevisto';
    details = error.message;
    if (import.meta.env.DEV) {
      stack = error.stack;
    }
  }

  return (
    <Box
      sx={{
        minHeight: '75vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 6,
        px: 2,
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={0}
          variant="outlined"
          sx={{
            p: { xs: 4, sm: 6 },
            borderRadius: 4,
            textAlign: 'center',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top accent bar */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 5,
              backgroundColor: is404 ? 'warning.main' : 'error.main',
            }}
          />

          <Stack spacing={3} sx={{ alignItems: 'center' }}>
            <Avatar
              alt="Amazing Shop"
              src="/logo/square.png"
              sx={{
                width: 72,
                height: 72,
                boxShadow: 2,
                border: '3px solid white',
              }}
            />

            <Chip
              label={badge}
              color={is404 ? 'warning' : 'error'}
              variant="outlined"
              size="small"
              sx={{
                fontWeight: 700,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
                fontSize: '0.75rem',
              }}
            />

            <Box>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 800,
                  color: 'text.primary',
                  letterSpacing: -0.5,
                  mb: 1.5,
                }}
              >
                {title}
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  maxWidth: 540,
                  mx: 'auto',
                  lineHeight: 1.7,
                  fontSize: '1.05rem',
                }}
              >
                {details}
              </Typography>
            </Box>

            {/* Action buttons */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{
                pt: 1,
                width: '100%',
                maxWidth: 400,
                justifyContent: 'center',
              }}
            >
              <Button
                component={NavLink}
                to="/"
                variant="contained"
                color="primary"
                fullWidth
                sx={{
                  py: 1.3,
                  borderRadius: 2.5,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  boxShadow: 2,
                }}
              >
                Torna al catalogo
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                fullWidth
                onClick={() => {
                  location.reload();
                }}
                sx={{
                  py: 1.3,
                  borderRadius: 2.5,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                }}
              >
                Ricarica pagina
              </Button>
            </Stack>

            {/* Technical stack trace in development */}
            {stack && (
              <Box sx={{ width: '100%', mt: 3, textAlign: 'left' }}>
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    Stack Trace diagnostico (solo ambiente di sviluppo):
                  </Typography>
                </Alert>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    bgcolor: 'grey.900',
                    color: 'grey.100',
                    borderRadius: 2,
                    overflowX: 'auto',
                    maxHeight: 280,
                  }}
                >
                  <pre
                    style={{
                      margin: 0,
                      fontSize: '0.8rem',
                      fontFamily: 'monospace',
                      lineHeight: 1.5,
                    }}
                  >
                    <code>{stack}</code>
                  </pre>
                </Paper>
              </Box>
            )}
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
