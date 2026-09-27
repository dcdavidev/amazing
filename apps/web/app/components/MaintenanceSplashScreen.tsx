import React from 'react';

import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

export interface MaintenanceSplashScreenProps {
  readonly isChecking?: boolean;
  readonly onRetry?: () => void;
}

/**
 * Splash screen displayed when the website is undergoing maintenance.
 *
 * Informs the user in Italian that maintenance is underway and prompts them to try again later,
 * without exposing technical infrastructure details.
 *
 * @param props - Component properties.
 * @returns Splash screen React element.
 */
export function MaintenanceSplashScreen({
  isChecking = false,
  onRetry,
}: MaintenanceSplashScreenProps) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 4,
        background:
          'radial-gradient(circle at 50% 20%, rgba(25, 118, 210, 0.08) 0%, rgba(245, 247, 250, 1) 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          variant="outlined"
          sx={{
            p: { xs: 4, sm: 6 },
            borderRadius: 4,
            textAlign: 'center',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.06)',
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
              backgroundColor: 'warning.main',
            }}
          />

          <Stack spacing={3} sx={{ alignItems: 'center' }}>
            {/* Logo */}
            <Avatar
              alt="Amazing Shop"
              src="/logo/square.png"
              sx={{
                width: 76,
                height: 76,
                boxShadow: 2,
                border: '3px solid white',
              }}
            />

            {/* Badge */}
            <Chip
              label="Manutenzione del sito"
              color="warning"
              variant="outlined"
              size="small"
              sx={{
                fontWeight: 600,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
                fontSize: '0.72rem',
              }}
            />

            {/* Title & Description */}
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
                Sito in Manutenzione
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  lineHeight: 1.7,
                  fontSize: '1.05rem',
                }}
              >
                Stiamo attualmente effettuando interventi di manutenzione sul
                sito <strong>Amazing Shop</strong>. Ti invitiamo a riprovare più
                tardi a visitare il sito web.
              </Typography>
            </Box>

            {/* Action Button */}
            {onRetry && (
              <Box sx={{ pt: 1, width: '100%', maxWidth: 280 }}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={isChecking}
                  onClick={onRetry}
                  sx={{
                    py: 1.3,
                    borderRadius: 2.5,
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    boxShadow: 2,
                  }}
                >
                  {isChecking ? (
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <CircularProgress size={18} color="inherit" />
                      <span>Verifica in corso...</span>
                    </Box>
                  ) : (
                    'Riprova adesso'
                  )}
                </Button>
              </Box>
            )}
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
