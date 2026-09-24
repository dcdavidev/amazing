import { useEffect, useState } from 'react';

import { Link } from 'react-router';

import axios from 'axios';

import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

import type { Route } from './+types/home';

import { fetchArticles } from '~/services/fetch-articles';
import type { ArticleOption } from '~/types/article';

/**
 * Route metadata descriptors.
 *
 * @returns Metadata array defining page title.
 */
export function meta(): Route.MetaDescriptors {
  return [{ title: 'Catalogo Articoli | Amazing Shop' }];
}

/**
 * E-commerce homepage displaying catalog articles with best prices and purchasing options.
 *
 * @returns Rendered e-commerce catalog page.
 */
export default function Home() {
  const [articles, setArticles] = useState<readonly ArticleOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadCatalog(): Promise<void> {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchArticles();
        if (!isMounted) {
          return;
        }
        setArticles(data);
      } catch (error_: unknown) {
        if (!isMounted) {
          return;
        }
        if (axios.isAxiosError(error_)) {
          const apiMessage =
            typeof error_.response?.data?.error === 'string'
              ? error_.response.data.error
              : error_.message;
          setError(apiMessage);
        } else {
          setError(
            error_ instanceof Error
              ? error_.message
              : 'Impossibile caricare il catalogo articoli'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadCatalog();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, py: 2 }}>
      {/* Hero Banner */}
      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 3,
          background:
            'linear-gradient(135deg, rgba(25, 118, 210, 0.06) 0%, rgba(25, 118, 210, 0.01) 100%)',
          borderColor: 'divider',
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ color: 'text.primary', fontWeight: 'bold' }}
        >
          Catalogo Prodotti
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ maxWidth: 700 }}
        >
          Esplora la nostra selezione di articoli per l&apos;ufficio e
          l&apos;azienda. Confrontiamo in tempo reale i fornitori per offrirti
          sempre il prezzo più vantaggioso e la consegna più rapida.
        </Typography>
      </Paper>

      {/* Error Feedback */}
      {error && <Alert severity="error">{error}</Alert>}

      {/* Loading State */}
      {loading && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '30vh',
            gap: 2,
          }}
        >
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            Caricamento prodotti in corso...
          </Typography>
        </Box>
      )}

      {/* Products Grid */}
      {!loading && !error && (
        <Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
              Articoli disponibili ({articles.length})
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {articles.map((article) => {
              const articleUrl = `/articles/${article.id}`;
              const formattedPrice =
                article.minPrice !== null && article.minPrice !== undefined
                  ? `${article.minPrice.toFixed(2)} €`
                  : null;

              return (
                <Grid key={article.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 2,
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: 3,
                      },
                    }}
                  >
                    <CardActionArea
                      component={Link}
                      to={articleUrl}
                      sx={{
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'stretch',
                      }}
                    >
                      {/* Product Image Preview */}
                      <Box
                        sx={{
                          height: 200,
                          backgroundColor: 'grey.50',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          p: 2,
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          component="img"
                          src="/articles/monitor-17-philips.jpg"
                          alt={article.name}
                          sx={{
                            maxHeight: '100%',
                            maxWidth: '100%',
                            objectFit: 'contain',
                            transition: 'transform 0.3s ease-in-out',
                            '&:hover': {
                              transform: 'scale(1.04)',
                            },
                          }}
                        />
                      </Box>

                      {/* Card Content */}
                      <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                        <Stack spacing={1}>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <Chip
                              label="In stock"
                              size="small"
                              color="success"
                              variant="outlined"
                              sx={{ fontSize: '0.75rem', height: 20 }}
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Disponibilità immediata
                            </Typography>
                          </Box>

                          <Typography
                            variant="h6"
                            component="h3"
                            sx={{
                              fontWeight: 'bold',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              lineHeight: 1.3,
                              minHeight: '2.6em',
                            }}
                          >
                            {article.name}
                          </Typography>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontSize: '0.85rem' }}
                          >
                            Monitor professionale ad alte prestazioni per
                            postazioni di lavoro.
                          </Typography>

                          {/* Pricing Section */}
                          <Box sx={{ pt: 1 }}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: 'block' }}
                            >
                              Prezzo più conveniente
                            </Typography>
                            {formattedPrice ? (
                              <Typography
                                variant="h5"
                                color="success.main"
                                sx={{ fontWeight: 'bold' }}
                              >
                                {formattedPrice}
                              </Typography>
                            ) : (
                              <Typography
                                variant="body1"
                                color="text.secondary"
                              >
                                Offerte da verificare
                              </Typography>
                            )}
                          </Box>
                        </Stack>
                      </CardContent>
                    </CardActionArea>

                    {/* Secondary Text Action Button */}
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button
                        component={Link}
                        to={articleUrl}
                        variant="text"
                        color="primary"
                        fullWidth
                        sx={{
                          textTransform: 'none',
                          fontWeight: 'bold',
                          justifyContent: 'flex-start',
                          px: 1,
                        }}
                      >
                        Altre opzioni d&apos;acquisto →
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}
    </Box>
  );
}
