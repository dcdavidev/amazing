import { useEffect, useState } from 'react';

import { Link, useParams } from 'react-router';

import axios from 'axios';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import type { Route } from './+types/article';

import { evaluateReplenishment } from '~/services/evaluate-replenishment';
import { fetchArticleById } from '~/services/fetch-article-by-id';
import type { ArticleDetail, ArticleSupplierOffer } from '~/types/article';
import type { ReplenishmentEvaluationResponse } from '~/types/replenishment';

/**
 * Route metadata descriptors.
 *
 * @returns Metadata array defining page title.
 */
export function meta(): Route.MetaDescriptors {
  return [{ title: 'Dettaglio Articolo | Amazing Shop' }];
}

/**
 * Article detail page displaying product overview, interactive order criteria,
 * and dynamically evaluated supplier purchasing options based on requested quantity and date.
 *
 * @returns Rendered article detail page.
 */
export default function ArticlePage() {
  const { id } = useParams<{ id: string }>();

  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Order criteria states (quantity and order date)
  const [quantity, setQuantity] = useState<number>(12);
  const [orderDate, setOrderDate] = useState<string>(() => {
    return new Date().toISOString().split('T', 1)[0] ?? '2026-09-24';
  });

  const [evaluation, setEvaluation] =
    useState<ReplenishmentEvaluationResponse | null>(null);
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [orderConfirmation, setOrderConfirmation] = useState<string | null>(
    null
  );

  // Fetch initial article details
  useEffect(() => {
    let isMounted = true;

    async function loadArticle(): Promise<void> {
      if (!id) {
        setError('Identificativo articolo mancante.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await fetchArticleById(id);
        if (!isMounted) {
          return;
        }
        setArticle(data);
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
              : 'Impossibile caricare i dati dell’articolo'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadArticle();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Evaluate replenishment offers whenever article, quantity, or orderDate changes
  useEffect(() => {
    let isMounted = true;

    async function runEvaluation(): Promise<void> {
      if (!id || !orderDate || quantity <= 0) {
        if (isMounted) {
          setEvaluation(null);
          setEvaluating(false);
        }
        return;
      }

      try {
        const isoDate = new Date(`${orderDate}T12:00:00Z`).toISOString();
        const proposal = await evaluateReplenishment({
          articleId: id as string,
          quantity,
          orderDate: isoDate,
        });
        if (isMounted) {
          setEvaluation(proposal);
        }
      } catch (error_: unknown) {
        if (isMounted && axios.isAxiosError(error_)) {
          const apiMessage =
            typeof error_.response?.data?.error === 'string'
              ? error_.response.data.error
              : error_.message;
          setError(apiMessage);
        }
      } finally {
        if (isMounted) {
          setEvaluating(false);
        }
      }
    }

    void runEvaluation();

    return () => {
      isMounted = false;
    };
  }, [id, quantity, orderDate]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '40vh',
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography variant="body1" color="text.secondary">
          Caricamento articolo in corso...
        </Typography>
      </Box>
    );
  }

  if (error || !article) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 4 }}>
        <Alert severity="error">{error ?? 'Articolo non trovato.'}</Alert>
        <Button
          component={Link}
          to="/"
          variant="outlined"
          sx={{ alignSelf: 'flex-start' }}
        >
          ← Torna al catalogo
        </Button>
      </Box>
    );
  }

  // Determine fastest shipping days among currently eligible suppliers
  const eligibleSuppliersList = evaluation?.eligibleSuppliers ?? [];
  const fastestEligibleDays =
    eligibleSuppliersList.length > 0
      ? Math.min(...eligibleSuppliersList.map((item) => item.minDaysToShip))
      : null;

  const minStartingPrice =
    article.offers.length > 0
      ? Math.min(...article.offers.map((offer) => offer.unitPrice))
      : null;

  const handleQuantityStep = (delta: number) => {
    setEvaluating(true);
    setQuantity((previous) => Math.max(1, previous + delta));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Navigation Breadcrumb */}
      <Box>
        <Button
          component={Link}
          to="/"
          variant="text"
          color="primary"
          sx={{ textTransform: 'none', px: 0 }}
        >
          ← Torna a tutti gli articoli
        </Button>
      </Box>

      {/* Product Overview Section */}
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 320,
              backgroundColor: 'grey.50',
              borderRadius: 2,
            }}
          >
            <Box
              component="img"
              src="/articles/monitor-17-philips.jpg"
              alt={article.name}
              sx={{
                maxHeight: 280,
                maxWidth: '100%',
                objectFit: 'contain',
                borderRadius: 1,
                filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.08))',
                mb: 2,
              }}
            />
            <Chip
              label="Elettronica & IT"
              size="small"
              color="primary"
              variant="outlined"
            />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={2}>
            <Box>
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{ fontWeight: 'bold' }}
              >
                {article.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Codice Articolo: {article.id}
              </Typography>
            </Box>

            {minStartingPrice !== null && (
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  A partire da
                </Typography>
                <Typography
                  variant="h4"
                  color="success.main"
                  sx={{ fontWeight: 'bold' }}
                >
                  {minStartingPrice.toFixed(2)} €
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  / pezzo (IVA inclusa)
                </Typography>
              </Box>
            )}

            <Divider />

            <Box>
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ fontWeight: 'bold' }}
              >
                Descrizione Prodotto
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Display professionale ad alta definizione ideale per ufficio,
                studi tecnici e ambienti commerciali. Progettato con tecnologia
                anti-sfarfallio (Flicker-Free) e filtro per la luce blu per
                ridurre l&apos;affaticamento visivo durante le lunghe sessioni
                di lavoro. Offre connettività versatile, consumi energetici
                ridotti e supporto ergonomico standard VESA.
              </Typography>
            </Box>

            <Box
              sx={{
                p: 2,
                borderRadius: 1,
                backgroundColor: 'grey.50',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography
                variant="subtitle2"
                gutterBottom
                sx={{ fontWeight: 'bold' }}
              >
                Specifiche Principali:
              </Typography>
              <Grid container spacing={1}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    • Dimensione: 17&quot; Standard
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    • Risoluzione: HD 1280x1024
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    • Ingressi: VGA, DVI-D
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    • Garanzia: 2 Anni Ufficiale
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Stack>
        </Grid>
      </Grid>

      {/* Replenishment Order Criteria Configuration Panel */}
      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          p: 3,
          borderRadius: 2,
          backgroundColor: 'grey.50',
          borderColor: 'divider',
        }}
      >
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
              Parametri d&apos;Ordine e Simulazione Rifornimento
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Seleziona la quantità desiderata e la data dell&apos;ordine per
              verificare i fornitori idonei, le regole di sconto applicabili e
              la miglior scelta economica.
            </Typography>
          </Box>

          <Grid container spacing={3} sx={{ alignItems: 'center' }}>
            {/* Quantity Selector */}
            <Grid size={{ xs: 12, sm: 6, md: 5 }}>
              <Typography
                variant="subtitle2"
                gutterBottom
                sx={{ fontWeight: 'medium' }}
              >
                Quantità da ordinare (pezzi):
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="medium"
                  disabled={quantity <= 1}
                  onClick={() => handleQuantityStep(-1)}
                  sx={{
                    minWidth: 42,
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    py: 0.5,
                  }}
                >
                  −
                </Button>
                <TextField
                  size="small"
                  type="number"
                  value={quantity}
                  onChange={(event) => {
                    const parsed = Number(event.target.value);
                    setEvaluating(true);
                    setQuantity(
                      Number.isNaN(parsed) || parsed < 1
                        ? 1
                        : Math.trunc(parsed)
                    );
                  }}
                  slotProps={{
                    htmlInput: {
                      min: 1,
                      style: {
                        textAlign: 'center',
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                        width: 80,
                      },
                    },
                  }}
                />
                <Button
                  variant="outlined"
                  size="medium"
                  onClick={() => handleQuantityStep(1)}
                  sx={{
                    minWidth: 42,
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    py: 0.5,
                  }}
                >
                  +
                </Button>
              </Box>
            </Grid>

            {/* Order Date Input */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Typography
                variant="subtitle2"
                gutterBottom
                sx={{ fontWeight: 'medium' }}
              >
                Data Ordine:
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="date"
                value={orderDate}
                onChange={(event) => {
                  setEvaluating(true);
                  setOrderDate(event.target.value);
                }}
                slotProps={{
                  inputLabel: { shrink: true },
                }}
              />
            </Grid>

            {/* Status indicator */}
            <Grid size={{ xs: 12, md: 3 }}>
              {evaluating ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2" color="text.secondary">
                    Calcolo offerte...
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {eligibleSuppliersList.length} di {article.offers.length}{' '}
                  fornitori idonei per {quantity} pz
                </Typography>
              )}
            </Grid>
          </Grid>
        </Stack>
      </Paper>

      {/* Order Confirmation Feedback */}
      {orderConfirmation && (
        <Alert
          severity="success"
          onClose={() => setOrderConfirmation(null)}
          sx={{ fontWeight: 'medium' }}
        >
          {orderConfirmation}
        </Alert>
      )}

      {/* Purchasing Options Section */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
            Opzioni d&apos;Acquisto dei Fornitori
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tutte le opzioni disponibili. Le offerte con giacenza insufficiente
            per la quantità richiesta ({quantity} pz) vengono disabilitate
            automaticamente.
          </Typography>
        </Box>

        <Stack spacing={2} sx={{ mt: 1 }}>
          {article.offers.map((offer: ArticleSupplierOffer) => {
            const hasStockForOrder = offer.stockQuantity >= quantity;
            const evalResult = evaluation?.eligibleSuppliers.find(
              (item) => item.supplierId === offer.supplierId
            );
            const isEligible = hasStockForOrder && evalResult !== undefined;
            const isCheapest = isEligible && evalResult.isCheapest;
            const isFastest =
              isEligible &&
              fastestEligibleDays !== null &&
              offer.minDaysToShip === fastestEligibleDays;
            const isSelected = selectedOfferId === offer.supplierId;

            const baseAmount = offer.unitPrice * quantity;
            const finalAmount = evalResult
              ? evalResult.finalAmount
              : baseAmount;
            const discountPercentage = evalResult?.totalDiscountPercentage ?? 0;

            return (
              <Card
                key={offer.supplierId}
                variant="outlined"
                sx={{
                  transition: 'all 0.2s ease-in-out',
                  borderColor: isEligible
                    ? isCheapest
                      ? 'success.main'
                      : isSelected
                        ? 'primary.main'
                        : 'divider'
                    : 'grey.300',
                  borderWidth: isCheapest && isEligible ? 2 : 1,
                  backgroundColor: isEligible
                    ? isCheapest
                      ? 'rgba(46, 125, 50, 0.04)'
                      : 'background.paper'
                    : 'grey.100',
                  color: isEligible ? 'text.primary' : 'text.disabled',
                  boxShadow: isCheapest && isEligible ? 2 : 0,
                  opacity: isEligible ? 1 : 0.72,
                }}
              >
                <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                  <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                    {/* Supplier Information */}
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Typography
                          variant="h6"
                          component="h3"
                          sx={{
                            fontWeight: isCheapest ? 'bold' : 'medium',
                            color: isEligible
                              ? 'text.primary'
                              : 'text.disabled',
                          }}
                        >
                          {offer.supplierName}
                        </Typography>
                        {isCheapest && isEligible && (
                          <Chip
                            label="Miglior Scelta"
                            color="success"
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                          />
                        )}
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: isEligible
                            ? 'text.secondary'
                            : 'text.disabled',
                        }}
                      >
                        Fornitore certificato
                      </Typography>
                    </Grid>

                    {/* Shipping, Stock, and Discount Badges */}
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Stack
                        direction="row"
                        spacing={1}
                        useFlexGap
                        sx={{ flexWrap: 'wrap' }}
                      >
                        {/* Fastest shipping badge */}
                        {isFastest && (
                          <Chip
                            label={`Spedizione più rapida (${offer.minDaysToShip} gg)`}
                            color="info"
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                          />
                        )}
                        {!isFastest && (
                          <Chip
                            label={`Spedizione: ${offer.minDaysToShip} gg`}
                            size="small"
                            variant="outlined"
                            sx={{
                              color: isEligible
                                ? 'text.secondary'
                                : 'text.disabled',
                              borderColor: isEligible ? 'divider' : 'grey.300',
                            }}
                          />
                        )}

                        {/* Stock status badge */}
                        {hasStockForOrder ? (
                          <Chip
                            label={`${offer.stockQuantity} pz a magazzino`}
                            size="small"
                            variant="outlined"
                            color="success"
                          />
                        ) : (
                          <Chip
                            label={`Giacenza insufficiente: ${offer.stockQuantity} pz su ${quantity} richiesti`}
                            size="small"
                            variant="outlined"
                            color="error"
                            sx={{ fontWeight: 'medium' }}
                          />
                        )}

                        {/* Discount applied badge */}
                        {isEligible && discountPercentage > 0 && (
                          <Chip
                            label={`Sconto: -${discountPercentage}%`}
                            size="small"
                            color="warning"
                            variant="outlined"
                            sx={{ fontWeight: 'bold' }}
                          />
                        )}
                      </Stack>
                    </Grid>

                    {/* Pricing Breakdown and Add to Cart Action */}
                    <Grid
                      size={{ xs: 12, sm: 4 }}
                      sx={{
                        textAlign: { xs: 'left', sm: 'right' },
                        display: 'flex',
                        flexDirection: { xs: 'row', sm: 'column' },
                        alignItems: { xs: 'center', sm: 'flex-end' },
                        justifyContent: {
                          xs: 'space-between',
                          sm: 'center',
                        },
                        gap: 1,
                      }}
                    >
                      <Box>
                        {isEligible ? (
                          <>
                            {discountPercentage > 0 && (
                              <Typography
                                variant="caption"
                                sx={{
                                  textDecoration: 'line-through',
                                  color: 'text.secondary',
                                  display: 'block',
                                }}
                              >
                                Base: {baseAmount.toFixed(2)} €
                              </Typography>
                            )}
                            <Typography
                              variant="h5"
                              sx={{
                                fontWeight: 'bold',
                                color: isCheapest
                                  ? 'success.main'
                                  : 'text.primary',
                              }}
                            >
                              {finalAmount.toFixed(2)} €
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: 'block' }}
                            >
                              Totale per {quantity} pz (
                              {offer.unitPrice.toFixed(2)} €/pz)
                            </Typography>
                          </>
                        ) : (
                          <>
                            <Typography
                              variant="body1"
                              sx={{
                                fontWeight: 'bold',
                                color: 'text.disabled',
                              }}
                            >
                              {offer.unitPrice.toFixed(2)} € / pz
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'error.main',
                                display: 'block',
                                fontWeight: 'medium',
                              }}
                            >
                              Non soddisfa la quantità ({quantity} pz)
                            </Typography>
                          </>
                        )}
                      </Box>

                      <Button
                        variant={isCheapest ? 'contained' : 'outlined'}
                        color={isCheapest ? 'success' : 'primary'}
                        size="medium"
                        disabled={!isEligible}
                        onClick={() => {
                          setSelectedOfferId(offer.supplierId);
                          setOrderConfirmation(
                            `Ordine registrato: ${quantity}x ${article.name} da ${offer.supplierName} per ${finalAmount.toFixed(2)} € (Consegna stimata: ${offer.minDaysToShip} gg)`
                          );
                        }}
                        sx={{ textTransform: 'none', fontWeight: 'bold' }}
                      >
                        {isEligible
                          ? isSelected
                            ? 'Selezionato nel carrello ✓'
                            : isCheapest
                              ? 'Aggiungi al carrello (Miglior scelta)'
                              : 'Aggiungi al carrello'
                          : 'Quantità non disponibile'}
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      </Box>
    </Box>
  );
}
