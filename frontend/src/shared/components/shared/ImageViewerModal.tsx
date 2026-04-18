import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Fade,
  CircularProgress,
} from "@mui/material";
import { Close, ZoomIn, ZoomOut } from "@mui/icons-material";
import { useState, useEffect } from "react";
import api from "../../../lib/axios";

interface ImageViewerModalProps {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
  isDirectUrl?: boolean; // If true, use imageUrl directly without API fetch (for data URLs or public URLs)
}

const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  open,
  onClose,
  imageUrl,
  title,
  isDirectUrl = false,
}) => {
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);
  const [blobUrl, setBlobUrl] = useState<string>("");

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleClose = () => {
    setZoom(1);
    setLoading(true);
    if (blobUrl && !isDirectUrl) {
      URL.revokeObjectURL(blobUrl);
    }
    setBlobUrl("");
    onClose();
  };

  useEffect(() => {
    if (open && imageUrl) {
      // Check if it's a direct URL (data URL, blob URL, or external URL)
      const isDataUrl = imageUrl.startsWith("data:");
      const isBlobUrl = imageUrl.startsWith("blob:");
      const isExternalUrl = imageUrl.startsWith("http");
      
      if (isDirectUrl || isDataUrl || isBlobUrl || isExternalUrl) {
        // Use URL directly without API fetch
        setBlobUrl(imageUrl);
        setLoading(false);
      } else {
        // Fetch image with authentication
        setLoading(true);
        api
          .get(imageUrl, { responseType: "blob" })
          .then((response) => {
            const url = URL.createObjectURL(response.data);
            setBlobUrl(url);
            setLoading(false);
          })
          .catch((error) => {
            console.error("Failed to load image:", error);
            setLoading(false);
          });
      }
    }

    return () => {
      // Only revoke if it was created via createObjectURL (not for data URLs or direct URLs)
      if (blobUrl && !blobUrl.startsWith("data:") && !isDirectUrl && !blobUrl.startsWith("http")) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [open, imageUrl, isDirectUrl]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      TransitionComponent={Fade}
      TransitionProps={{
        timeout: 300,
      }}
      PaperProps={{
        sx: {
          bgcolor: "#000",
          maxHeight: "90vh",
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          bgcolor: "#000",
          minHeight: "60vh",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)",
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {title && (
            <Typography variant="h6" sx={{ color: "white", fontWeight: 600 }}>
              {title}
            </Typography>
          )}
          <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
            <IconButton
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              sx={{
                color: "white",
                bgcolor: "rgba(255,255,255,0.1)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                "&:disabled": { color: "rgba(255,255,255,0.3)" },
              }}
            >
              <ZoomOut />
            </IconButton>
            <IconButton
              onClick={handleZoomIn}
              disabled={zoom >= 3}
              sx={{
                color: "white",
                bgcolor: "rgba(255,255,255,0.1)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                "&:disabled": { color: "rgba(255,255,255,0.3)" },
              }}
            >
              <ZoomIn />
            </IconButton>
            <IconButton
              onClick={handleClose}
              sx={{
                color: "white",
                bgcolor: "rgba(255,255,255,0.1)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
              }}
            >
              <Close />
            </IconButton>
          </Box>
        </Box>

        {/* Image Content */}
        <DialogContent
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 3,
            minHeight: "60vh",
            overflow: "auto",
            bgcolor: "#000",
          }}
        >
          {loading && (
            <CircularProgress
              sx={{
                color: "white",
                position: "absolute",
              }}
            />
          )}
          <Fade in={!loading && !!blobUrl} timeout={500}>
            <Box
              component="img"
              src={blobUrl}
              alt={title || "Document"}
              sx={{
                maxWidth: "100%",
                maxHeight: "80vh",
                objectFit: "contain",
                transform: `scale(${zoom})`,
                transition: "transform 0.3s ease-in-out",
                cursor: zoom > 1 ? "grab" : "default",
                "&:active": {
                  cursor: zoom > 1 ? "grabbing" : "default",
                },
              }}
            />
          </Fade>
        </DialogContent>

        {/* Footer - Zoom indicator */}
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            background:
              "linear-gradient(0deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)",
            p: 2,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Typography variant="body2" sx={{ color: "white", fontWeight: 500 }}>
            {Math.round(zoom * 100)}%
          </Typography>
        </Box>
      </Box>
    </Dialog>
  );
};

export default ImageViewerModal;
