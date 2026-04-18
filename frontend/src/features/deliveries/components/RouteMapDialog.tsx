import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
  alpha,
  Stack,
  Chip,
  Grid,
} from "@mui/material";
import {
  Close,
  DirectionsCar,
  LocationOn,
  LocalShipping,
} from "@mui/icons-material";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in React-Leaflet
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface Location {
  address: string;
  city: string;
  postalCode?: string;
}

interface RouteMapDialogProps {
  open: boolean;
  onClose: () => void;
  pickupLocation: Location;
  deliveryLocation: Location;
  donationTitle: string;
}

// Component to fit bounds
const FitBounds = ({ coordinates }: { coordinates: [number, number][] }) => {
  const map = useMap();

  useEffect(() => {
    if (coordinates.length > 0) {
      const bounds = L.latLngBounds(coordinates);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [coordinates, map]);

  return null;
};

export const RouteMapDialog = ({
  open,
  onClose,
  pickupLocation,
  deliveryLocation,
  donationTitle,
}: RouteMapDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [routeData, setRouteData] = useState<{
    coordinates: [number, number][];
    distance: number;
    duration: number;
    pickupCoords: [number, number];
    deliveryCoords: [number, number];
  } | null>(null);

  useEffect(() => {
    if (open) {
      fetchRoute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pickupLocation, deliveryLocation]);

  const fetchRoute = async () => {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Geocode pickup location
      const pickupQuery = `${pickupLocation.address}, ${pickupLocation.city}`;
      const pickupGeoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          pickupQuery
        )}&limit=1`
      );
      const pickupGeoData = await pickupGeoRes.json();

      if (!pickupGeoData || pickupGeoData.length === 0) {
        throw new Error("Could not find pickup location");
      }

      const pickupCoords: [number, number] = [
        parseFloat(pickupGeoData[0].lat),
        parseFloat(pickupGeoData[0].lon),
      ];

      // Step 2: Geocode delivery location
      const deliveryQuery = `${deliveryLocation.address}, ${deliveryLocation.city}`;
      const deliveryGeoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          deliveryQuery
        )}&limit=1`
      );
      const deliveryGeoData = await deliveryGeoRes.json();

      if (!deliveryGeoData || deliveryGeoData.length === 0) {
        throw new Error("Could not find delivery location");
      }

      const deliveryCoords: [number, number] = [
        parseFloat(deliveryGeoData[0].lat),
        parseFloat(deliveryGeoData[0].lon),
      ];

      // Step 3: Get route using OSRM
      const routeRes = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${pickupCoords[1]},${pickupCoords[0]};${deliveryCoords[1]},${deliveryCoords[0]}?overview=full&geometries=geojson`
      );
      const routeResData = await routeRes.json();

      if (!routeResData.routes || routeResData.routes.length === 0) {
        throw new Error("Could not calculate route");
      }

      const route = routeResData.routes[0];
      const coordinates: [number, number][] = route.geometry.coordinates.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (coord: any) => [coord[1], coord[0]] as [number, number]
      );

      setRouteData({
        coordinates,
        distance: route.distance / 1000, // Convert to km
        duration: route.duration / 60, // Convert to minutes
        pickupCoords,
        deliveryCoords,
      });
    } catch (err) {
      setError((err as Error).message || "Failed to load route");
    } finally {
      setLoading(false);
    }
  };

  const formatDistance = (km: number) => {
    return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.round(minutes)} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}min`;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          height: "80vh",
          maxHeight: 800,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <DirectionsCar sx={{ color: "primary.main", fontSize: 32 }} />
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Delivery Route
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {donationTitle}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{ p: 0, display: "flex", flexDirection: "column", height: "100%" }}
      >
        {loading && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <CircularProgress size={60} />
            <Typography variant="body2" color="text.secondary">
              Calculating route...
            </Typography>
          </Box>
        )}

        {error && (
          <Box sx={{ p: 3 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        {!loading && !error && routeData && (
          <>
            {/* Route Info */}
            <Box
              sx={{
                p: 2,
                bgcolor: alpha("#3b82f6", 0.05),
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Stack direction="row" spacing={2} justifyContent="center">
                <Chip
                  icon={<DirectionsCar />}
                  label={`Distance: ${formatDistance(routeData.distance)}`}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  icon={<LocalShipping />}
                  label={`Duration: ${formatDuration(routeData.duration)}`}
                  color="primary"
                  variant="outlined"
                />
              </Stack>
            </Box>

            {/* Map */}
            <Box sx={{ flex: 1, position: "relative" }}>
              <MapContainer
                center={routeData.pickupCoords}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Pickup Marker */}
                <Marker position={routeData.pickupCoords}>
                  <Popup>
                    <Box>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <LocationOn fontSize="small" color="error" />
                        Pickup Location
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {pickupLocation.address}
                      </Typography>
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        {pickupLocation.city}
                      </Typography>
                    </Box>
                  </Popup>
                </Marker>

                {/* Delivery Marker */}
                <Marker position={routeData.deliveryCoords}>
                  <Popup>
                    <Box>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <LocalShipping fontSize="small" color="primary" />
                        Delivery Location
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {deliveryLocation.address}
                      </Typography>
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        {deliveryLocation.city}
                      </Typography>
                    </Box>
                  </Popup>
                </Marker>

                {/* Route Line */}
                <Polyline
                  positions={routeData.coordinates}
                  pathOptions={{
                    color: "#3b82f6",
                    weight: 4,
                    opacity: 0.7,
                  }}
                />

                {/* Fit bounds to show entire route */}
                <FitBounds
                  coordinates={[
                    ...routeData.coordinates,
                    routeData.pickupCoords,
                    routeData.deliveryCoords,
                  ]}
                />
              </MapContainer>
            </Box>

            {/* Location Details */}
            <Box
              sx={{
                p: 2,
                borderTop: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        mb: 0.5,
                      }}
                    >
                      <LocationOn fontSize="small" />
                      From
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {pickupLocation.address}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {pickupLocation.city}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        mb: 0.5,
                      }}
                    >
                      <LocalShipping fontSize="small" />
                      To
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {deliveryLocation.address}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {deliveryLocation.city}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
