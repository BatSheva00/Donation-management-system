import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Button,
  Typography,
  Box,
  alpha,
  Grid,
  Tabs,
  Tab,
  Stack,
  Chip,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
} from "@mui/material";
import {
  CheckCircle,
  LocationOn,
  Business,
  LocalShipping,
  Upload,
  Person,
  Description,
  Delete,
  Visibility,
  InsertDriveFile,
} from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import api from "../../lib/axios";
import { useAuthStore } from "../../shared/stores/authStore";
import { Input, Select, TextArea } from "../../shared/components/forms";
import ProfileImageUpload from "../../shared/components/shared/ProfileImageUpload";
import AddressAutocomplete from "../../shared/components/forms/AddressAutocomplete";
import ImageViewerModal from "../../shared/components/shared/ImageViewerModal";
import { useTranslation } from "react-i18next";

// Schema factories that accept translation function
const createAddressSchema = (t: (key: string) => string) => z.object({
  street: z.string().min(1, t("validation.streetRequired")),
  city: z.string().min(1, t("validation.cityRequired")),
  zipCode: z.string().optional(),
});

const createBusinessSchema = (t: (key: string) => string) => z.object({
  businessName: z.string().min(1, t("validation.businessNameRequired")),
  businessType: z.string().min(1, t("validation.businessTypeRequired")),
  registrationNumber: z.string().optional(),
  description: z.string().min(10, t("validation.descriptionMinLength")),
  website: z.string().url(t("validation.invalidUrl")).optional().or(z.literal("")),
});

const createDriverSchema = (t: (key: string) => string) => z.object({
  licenseNumber: z.string().min(1, t("validation.licenseNumberRequired")),
  licenseExpiry: z.string().min(1, t("validation.licenseExpiryRequired")),
  vehicleType: z.string().min(1, t("validation.vehicleTypeRequired")),
  vehicleModel: z.string().optional(),
  vehiclePlateNumber: z.string().min(1, t("validation.vehiclePlateRequired")),
  vehicleCapacity: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
    z.number().optional()
  ),
});

const createBaseProfileSchema = (t: (key: string) => string) => z.object({
  address: createAddressSchema(t),
});

const createBusinessProfileSchema = (t: (key: string) => string) => z.object({
  address: createAddressSchema(t),
  businessInfo: createBusinessSchema(t),
});

const createDriverProfileSchema = (t: (key: string) => string) => z.object({
  address: createAddressSchema(t),
  driverInfo: createDriverSchema(t),
});

// Create type for form data
type ProfileFormData = {
  address: {
    street: string;
    city: string;
    zipCode?: string;
  };
  businessInfo?: {
    businessName: string;
    businessType: string;
    registrationNumber?: string;
    description: string;
    website?: string;
  };
  driverInfo?: {
    licenseNumber: string;
    licenseExpiry: string;
    vehicleType: string;
    vehicleModel?: string;
    vehiclePlateNumber: string;
    vehicleCapacity?: number;
  };
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const ProfileCompletionPage = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "he";
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [profileImageLoading, setProfileImageLoading] = useState(false);
  const [documents, setDocuments] = useState<
    Array<{ type: string; file: File; uploaded: boolean }>
  >([]);
  const [existingDocuments, setExistingDocuments] = useState<
    Array<{ _id: string; type: string; url: string; filename: string }>
  >([]);
  const [filePreviews, setFilePreviews] = useState<Record<string, string>>({});
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string; isDirectUrl: boolean } | null>(null);
  const [documentErrors, setDocumentErrors] = useState<Record<string, boolean>>({});
  const hasShownStatusToast = useRef(false);

  const isBusinessUser = user?.role?.key === "business";
  const isDriverUser = user?.role?.key === "driver";

  // Create schemas with translated error messages
  const profileSchema = isBusinessUser
    ? createBusinessProfileSchema(t)
    : isDriverUser
    ? createDriverProfileSchema(t)
    : createBaseProfileSchema(t);

  const {
    register,
    handleSubmit,
    trigger,
    control,
    clearErrors,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });


  // Fetch existing documents
  useEffect(() => {
    if (user?.documents && user.documents.length > 0) {
      setExistingDocuments(user.documents);
    }
  }, [user?.documents]);

  // Check user authentication and show status toast only once
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Only show status toast once when component first mounts with user data
    if (!hasShownStatusToast.current) {
      if (user.profileCompletionStatus === "rejected") {
        toast.error(t("profile.profileRejectedMessage"), { autoClose: 5000 });
        hasShownStatusToast.current = true;
      } else if (user.profileCompletionStatus === "pending_review") {
        toast.info(t("profile.profilePendingMessage"), { autoClose: 5000 });
        hasShownStatusToast.current = true;
      } else {
        hasShownStatusToast.current = true;
      }
    }
  }, [user, navigate, t]);

  // Early return after all hooks
  if (!user) {
    return null;
  }

  // Type-safe error access helper
  const formErrors = errors as any;

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleDocumentUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    documentType: string
  ) => {
    const files = event.target.files;
    if (!files) return;

    const newDocuments = Array.from(files).map((file) => ({
      type: documentType,
      file,
      uploaded: false,
    }));

    setDocuments([...documents, ...newDocuments]);
    toast.success(`${files.length} ${t("profile.documentAdded")}`);
  };

  const uploadDocument = async (
    file: File,
    documentType: string
  ): Promise<boolean> => {
    try {
      const formData = new FormData();
      formData.append("documents", file);
      formData.append("documentType", documentType);

      await api.post("/users/upload-documents", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return true;
    } catch (error) {
      console.error("Failed to upload document:", error);
      return false;
    }
  };

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const getDocumentTypes = () => {
    if (isBusinessUser) {
      return [
        { value: "id", label: t("profile.idPassport"), required: true },
        { value: "business_license", label: t("profile.businessLicense"), required: true },
        { value: "tax_certificate", label: t("profile.taxCertificate"), required: false },
        { value: "other", label: t("profile.otherDocuments"), required: false },
      ];
    }
    if (isDriverUser) {
      return [
        { value: "id", label: t("profile.idPassport"), required: true },
        { value: "drivers_license", label: t("profile.driversLicense"), required: true },
        { value: "vehicle_registration", label: t("profile.vehicleRegistration"), required: true },
        { value: "insurance", label: t("profile.insuranceCertificate"), required: false },
        { value: "other", label: t("profile.otherDocuments"), required: false },
      ];
    }
    return [
      { value: "id", label: t("profile.idPassport"), required: true },
      { value: "other", label: t("profile.otherDocuments"), required: false },
    ];
  };

  // Check if required documents are uploaded
  const getMissingRequiredDocs = () => {
    const documentTypes = getDocumentTypes();
    const requiredTypes = documentTypes.filter((d) => d.required);
    const missingDocs: string[] = [];

    requiredTypes.forEach((docType) => {
      const hasExisting = existingDocuments.some((d) => d.type === docType.value);
      const hasPending = documents.some((d) => d.type === docType.value);
      if (!hasExisting && !hasPending) {
        missingDocs.push(docType.value);
      }
    });

    return missingDocs;
  };

  // Custom submit handler that checks both form and document validation
  const handleFormSubmit = async () => {
    // Clear previous document errors
    setDocumentErrors({});

    // Check profile info validation
    const isProfileValid = await trigger();
    
    // Check required documents
    const missingDocs = getMissingRequiredDocs();
    const hasDocErrors = missingDocs.length > 0;

    // Set document errors for display
    if (hasDocErrors) {
      const errors: Record<string, boolean> = {};
      missingDocs.forEach((docType) => {
        errors[docType] = true;
      });
      setDocumentErrors(errors);
    }

    // Determine what to do based on errors
    if (!isProfileValid && hasDocErrors) {
      // Both have errors - go to profile tab first (more important)
      toast.error(t("profile.fillRequiredFields"));
      setActiveTab(0);
      return;
    }

    if (!isProfileValid) {
      // Only profile has errors
      toast.error(t("profile.fillRequiredFields"));
      setActiveTab(0);
      return;
    }

    if (hasDocErrors) {
      // Only documents have errors
      toast.error(t("profile.uploadRequiredDocs"));
      setActiveTab(1);
      return;
    }

    // All validation passed - proceed with submission
    handleSubmit(onSubmit)();
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setLoading(true);

      // Upload profile image if selected
      if (profileImage) {
        try {
          setProfileImageLoading(true);
          const imageFormData = new FormData();
          imageFormData.append("profileImage", profileImage);

          const uploadResponse = await api.post(
            "/users/upload-profile-image",
            imageFormData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          if (uploadResponse.data.data?.profileImage && user) {
            setUser({
              ...user,
              profileImage: uploadResponse.data.data.profileImage,
            });
          }
        } catch (error) {
          console.error("Failed to upload profile image:", error);
        } finally {
          setProfileImageLoading(false);
        }
      }

      // Submit profile data
      const response = await api.post("/users/complete-profile", data);

      if (response.data.data && user) {
        setUser({
          ...user,
          profileCompletionStatus: response.data.data.profileCompletionStatus,
        });
      }

      // Upload documents if any
      if (documents.length > 0) {
        toast.info(t("profile.uploadingDocuments"));

        for (let i = 0; i < documents.length; i++) {
          const doc = documents[i];
          if (!doc.uploaded) {
            const success = await uploadDocument(doc.file, doc.type);
            if (success) {
              setDocuments((prev) =>
                prev.map((d, idx) => (idx === i ? { ...d, uploaded: true } : d))
              );
            } else {
              toast.error(`${t("profile.failedToUpload")} ${doc.file.name}`);
            }
          }
        }
      }

      toast.success(t("profile.profileSubmitted"));
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("profile.updateError"));
    } finally {
      setLoading(false);
    }
  };

  const renderProfileInfoTab = () => (
    <Box>
      {/* Profile Image + Address Section - Side by Side */}
      <Grid container spacing={4}>
        {/* Profile Image */}
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              textAlign: "center",
              p: 3,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: alpha("#f8fafc", 0.5),
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              {t("profile.profileImageTitle")}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t("profile.profileImageDescription")}
            </Typography>
            <ProfileImageUpload
              currentImage={profileImagePreview || user?.profileImage}
              userName={`${user?.firstName || ""} ${user?.lastName || ""}`}
              onImageSelect={(file) => {
                setProfileImage(file);
                // Create preview
                const reader = new FileReader();
                reader.onloadend = () => {
                  setProfileImagePreview(reader.result as string);
                };
                reader.readAsDataURL(file);
              }}
              onImageRemove={() => {
                setProfileImage(null);
                setProfileImagePreview(null);
              }}
              loading={profileImageLoading}
              size={100}
            />
          </Box>
        </Grid>

        {/* Address Fields - Stacked Vertically */}
        <Grid item xs={12} md={8}>
          <Box>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              {t("profile.yourAddress")}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t("profile.addressDescription")}
            </Typography>

            <Stack spacing={2}>
              <Controller
                name="address.city"
                control={control}
                render={({ field }) => (
                  <AddressAutocomplete
                    type="city"
                    value={field.value || ""}
                    onChange={(value) => {
                      field.onChange(value);
                      if (errors.address?.city) {
                        clearErrors("address.city");
                      }
                    }}
                    label={t("profile.city")}
                    error={!!errors.address?.city}
                    helperText={errors.address?.city ? t("validation.cityRequired") : undefined}
                    required
                  />
                )}
              />

              <Controller
                name="address.street"
                control={control}
                render={({ field }) => (
                  <AddressAutocomplete
                    type="street"
                    value={field.value || ""}
                    onChange={(value) => {
                      field.onChange(value);
                      if (errors.address?.street) {
                        clearErrors("address.street");
                      }
                    }}
                    label={t("profile.streetAddress")}
                    error={!!errors.address?.street}
                    helperText={errors.address?.street ? t("validation.streetRequired") : undefined}
                    required
                  />
                )}
              />

              <Controller
                name="address.zipCode"
                control={control}
                render={({ field }) => (
                  <Input
                    fullWidth
                    label={t("profile.zipCodeOptional")}
                    {...field}
                    value={field.value || ""}
                    error={!!errors.address?.zipCode}
                    helperText={errors.address?.zipCode?.message}
                  />
                )}
              />
            </Stack>
          </Box>
        </Grid>
      </Grid>

      {/* Additional Info Section - Only for Business/Driver */}
      {(isBusinessUser || isDriverUser) && (
        <>
          <Divider sx={{ my: 4 }} />
          <Box>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              {t("profile.additionalInfo")}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {isBusinessUser
                ? t("profile.businessInfoDescription")
                : t("profile.driverInfoDescription")}
            </Typography>

            {isBusinessUser && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Input
                    fullWidth
                    label={t("profile.businessName")}
                    {...register("businessInfo.businessName", {
                      onChange: () => formErrors.businessInfo?.businessName && clearErrors("businessInfo.businessName"),
                    })}
                    error={!!formErrors.businessInfo?.businessName}
                    helperText={formErrors.businessInfo?.businessName?.message}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Select
                    fullWidth
                    label={t("profile.businessType")}
                    {...register("businessInfo.businessType", {
                      onChange: () => formErrors.businessInfo?.businessType && clearErrors("businessInfo.businessType"),
                    })}
                    error={!!formErrors.businessInfo?.businessType}
                    helperText={formErrors.businessInfo?.businessType?.message}
                    options={[
                      { value: "restaurant", label: t("profile.restaurant") },
                      { value: "grocery", label: t("profile.grocery") },
                      { value: "bakery", label: t("profile.bakery") },
                      { value: "cafe", label: t("profile.cafe") },
                      { value: "catering", label: t("profile.catering") },
                      { value: "food_bank", label: t("profile.foodBank") },
                      { value: "other", label: t("profile.other") },
                    ]}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Input
                    fullWidth
                    label={`${t("profile.registrationNumber")} (${t("profile.optional")})`}
                    {...register("businessInfo.registrationNumber")}
                    error={!!formErrors.businessInfo?.registrationNumber}
                    helperText={formErrors.businessInfo?.registrationNumber?.message}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextArea
                    fullWidth
                    minRows={3}
                    label={t("profile.description")}
                    {...register("businessInfo.description", {
                      onChange: () => formErrors.businessInfo?.description && clearErrors("businessInfo.description"),
                    })}
                    error={!!formErrors.businessInfo?.description}
                    helperText={formErrors.businessInfo?.description?.message}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Input
                    fullWidth
                    label={`${t("profile.website")} (${t("profile.optional")})`}
                    type="url"
                    {...register("businessInfo.website", {
                      onChange: () => formErrors.businessInfo?.website && clearErrors("businessInfo.website"),
                    })}
                    error={!!formErrors.businessInfo?.website}
                    helperText={formErrors.businessInfo?.website?.message}
                  />
                </Grid>
              </Grid>
            )}

            {isDriverUser && (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Input
                    fullWidth
                    label={t("profile.licenseNumber")}
                    {...register("driverInfo.licenseNumber", {
                      onChange: () => formErrors.driverInfo?.licenseNumber && clearErrors("driverInfo.licenseNumber"),
                    })}
                    error={!!formErrors.driverInfo?.licenseNumber}
                    helperText={formErrors.driverInfo?.licenseNumber?.message}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Input
                    fullWidth
                    type="date"
                    label={t("profile.licenseExpiry")}
                    {...register("driverInfo.licenseExpiry", {
                      onChange: () => formErrors.driverInfo?.licenseExpiry && clearErrors("driverInfo.licenseExpiry"),
                    })}
                    error={!!formErrors.driverInfo?.licenseExpiry}
                    helperText={formErrors.driverInfo?.licenseExpiry?.message}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Select
                    fullWidth
                    label={t("profile.vehicleType")}
                    {...register("driverInfo.vehicleType", {
                      onChange: () => formErrors.driverInfo?.vehicleType && clearErrors("driverInfo.vehicleType"),
                    })}
                    error={!!formErrors.driverInfo?.vehicleType}
                    helperText={formErrors.driverInfo?.vehicleType?.message}
                    options={[
                      { value: "car", label: t("profile.car") },
                      { value: "van", label: t("profile.van") },
                      { value: "truck", label: t("profile.truck") },
                      { value: "motorcycle", label: t("profile.motorcycle") },
                      { value: "bicycle", label: t("profile.bicycle") },
                    ]}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Input
                    fullWidth
                    label={`${t("profile.vehicleModel")} (${t("profile.optional")})`}
                    {...register("driverInfo.vehicleModel")}
                    error={!!formErrors.driverInfo?.vehicleModel}
                    helperText={formErrors.driverInfo?.vehicleModel?.message}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Input
                    fullWidth
                    label={t("profile.vehiclePlateNumber")}
                    {...register("driverInfo.vehiclePlateNumber", {
                      onChange: () => formErrors.driverInfo?.vehiclePlateNumber && clearErrors("driverInfo.vehiclePlateNumber"),
                    })}
                    error={!!formErrors.driverInfo?.vehiclePlateNumber}
                    helperText={formErrors.driverInfo?.vehiclePlateNumber?.message}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Input
                    fullWidth
                    type="number"
                    label={`${t("profile.vehicleCapacity")} (${t("profile.optional")})`}
                    {...register("driverInfo.vehicleCapacity")}
                    error={!!formErrors.driverInfo?.vehicleCapacity}
                    helperText={formErrors.driverInfo?.vehicleCapacity?.message}
                  />
                </Grid>
              </Grid>
            )}
          </Box>
        </>
      )}
    </Box>
  );

  const renderDocumentsTab = () => {
    const documentTypes = getDocumentTypes();
    const totalDocs = documents.length + existingDocuments.length;
    const maxDocs = 10;
    const canAddMore = totalDocs < maxDocs;

    // Get documents by type
    const getDocsByType = (type: string) => {
      const pending = documents.filter(d => d.type === type);
      const existing = existingDocuments.filter(d => d.type === type);
      return { pending, existing };
    };

    // Check if file is image
    const isImageFile = (file: File) => file.type.startsWith("image/");
    const isImageUrl = (url?: string) => url && (url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') || url.includes('.gif') || url.includes('.webp') || url.includes('/image'));

    // Create preview URL for file
    const getFilePreview = (file: File, index: number) => {
      const key = `${file.name}-${index}`;
      if (!filePreviews[key] && isImageFile(file)) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreviews(prev => ({ ...prev, [key]: reader.result as string }));
        };
        reader.readAsDataURL(file);
      }
      return filePreviews[key];
    };

    return (
      <Box>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          {t("profile.uploadDocuments")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {isBusinessUser
            ? t("profile.uploadDocumentsBusiness")
            : isDriverUser
            ? t("profile.uploadDocumentsDriver")
            : t("profile.uploadDocumentsUser")}
        </Typography>

        {/* Document Upload Boxes with Previews */}
        <Grid container spacing={2}>
          {documentTypes.map((docType) => {
            const { pending, existing } = getDocsByType(docType.value);
            const allDocs = [...existing, ...pending.map((p, i) => ({ ...p, isPending: true, pendingIndex: i }))];
            const hasUploads = allDocs.length > 0;
            const hasError = documentErrors[docType.value] && !hasUploads;

            return (
              <Grid item xs={12} sm={6} key={docType.value}>
                <Box
                  sx={{
                    border: hasError ? "2px solid" : hasUploads ? "1px solid" : "2px dashed",
                    borderColor: hasError ? "error.main" : hasUploads ? "divider" : "divider",
                    borderRadius: 2,
                    overflow: "hidden",
                    bgcolor: hasError ? alpha("#d32f2f", 0.02) : "background.paper",
                  }}
                >
                  {/* Header */}
                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: hasError ? alpha("#d32f2f", 0.08) : alpha("#359364", 0.05),
                      borderBottom: "1px solid",
                      borderColor: hasError ? alpha("#d32f2f", 0.3) : "divider",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography variant="body2" fontWeight={600} color={hasError ? "error.main" : "text.primary"}>
                      {docType.label}
                      {docType.required && (
                        <Box component="span" sx={{ color: "error.main", ms: 0.5 }}>
                          {" "}*
                        </Box>
                      )}
                    </Typography>
                    {allDocs.length > 0 && (
                      <Chip
                        label={`${allDocs.length}`}
                        size="small"
                        color="primary"
                        sx={{ height: 20, fontSize: "0.75rem" }}
                      />
                    )}
                  </Box>

                  {/* Content Area */}
                  {hasUploads ? (
                    <Box sx={{ p: 1.5, minHeight: 120 }}>
                      <Stack spacing={1}>
                        {allDocs.map((doc: any, idx) => {
                          const isPending = doc.isPending;
                          const isImage = isPending ? isImageFile(doc.file) : isImageUrl(doc.url);
                          const previewUrl = isPending ? getFilePreview(doc.file, doc.pendingIndex) : doc.url;
                          const fileName = isPending ? doc.file.name : doc.filename;
                          const fileSize = isPending ? (doc.file.size / 1024 / 1024).toFixed(2) : null;

                          return (
                            <Box
                              key={isPending ? `pending-${idx}` : doc._id || idx}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                p: 1,
                                borderRadius: 1,
                                bgcolor: isPending ? alpha("#359364", 0.04) : alpha("#f8fafc", 0.5),
                                border: "1px solid",
                                borderColor: isPending ? alpha("#359364", 0.2) : "divider",
                                position: "relative",
                              }}
                            >
                              {/* Preview Thumbnail */}
                              <Box
                                sx={{
                                  width: 50,
                                  height: 50,
                                  borderRadius: 1,
                                  overflow: "hidden",
                                  bgcolor: alpha("#000", 0.05),
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                  cursor: isImage && previewUrl ? "pointer" : "default",
                                }}
                                onClick={() => isImage && previewUrl && setPreviewImage({
                                  url: previewUrl,
                                  title: fileName || docType.label,
                                  isDirectUrl: isPending, // pending uploads use data URLs
                                })}
                              >
                                {isImage && previewUrl ? (
                                  <img
                                    src={previewUrl}
                                    alt={docType.label}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                  />
                                ) : (
                                  <Description sx={{ color: "primary.main", opacity: 0.5 }} />
                                )}
                              </Box>

                              {/* File Info */}
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="caption" fontWeight={600} noWrap display="block">
                                  {fileName || docType.label}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {isPending ? (
                                    `${fileSize} MB • ${t("profile.pending")}`
                                  ) : (
                                    <Chip
                                      label={t("profile.verified")}
                                      size="small"
                                      color="success"
                                      variant="outlined"
                                      icon={<CheckCircle />}
                                      sx={{ height: 18, fontSize: "0.65rem", "& .MuiChip-icon": { fontSize: 12 } }}
                                    />
                                  )}
                                </Typography>
                              </Box>

                              {/* Actions */}
                              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                {isImage && previewUrl && (
                                  <IconButton
                                    size="small"
                                    onClick={() => setPreviewImage({
                                      url: previewUrl,
                                      title: fileName || docType.label,
                                      isDirectUrl: isPending,
                                    })}
                                    sx={{ color: "primary.main" }}
                                  >
                                    <Visibility sx={{ fontSize: 18 }} />
                                  </IconButton>
                                )}
                                {isPending && (
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => {
                                      // Find the correct index in documents array
                                      const docIndex = documents.findIndex(
                                        (d) => d.type === doc.type && d.file.name === doc.file.name
                                      );
                                      if (docIndex !== -1) {
                                        removeDocument(docIndex);
                                      }
                                    }}
                                  >
                                    <Delete sx={{ fontSize: 18 }} />
                                  </IconButton>
                                )}
                              </Box>
                            </Box>
                          );
                        })}
                      </Stack>

                      {/* Add more to this type - only for "other" documents */}
                      {canAddMore && docType.value === "other" && (
                        <Box
                          component="label"
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 1,
                            mt: 1.5,
                            p: 1,
                            borderRadius: 1,
                            border: "1px dashed",
                            borderColor: "divider",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            "&:hover": {
                              borderColor: "primary.main",
                              bgcolor: alpha("#359364", 0.04),
                            },
                          }}
                        >
                          <input
                            type="file"
                            multiple
                            hidden
                            accept="image/*,.pdf"
                            onChange={(e) => handleDocumentUpload(e, docType.value)}
                          />
                          <Upload sx={{ fontSize: 18, color: "text.secondary" }} />
                          <Typography variant="caption" color="text.secondary">
                            {t("profile.addMore")}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <Box
                      component="label"
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        p: 3,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        minHeight: 120,
                        "&:hover": {
                          bgcolor: hasError ? alpha("#d32f2f", 0.04) : alpha("#359364", 0.04),
                        },
                      }}
                    >
                      <input
                        type="file"
                        multiple
                        hidden
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          handleDocumentUpload(e, docType.value);
                          // Clear error when user uploads
                          if (documentErrors[docType.value]) {
                            setDocumentErrors(prev => ({ ...prev, [docType.value]: false }));
                          }
                        }}
                      />
                      <Upload sx={{ fontSize: 32, color: hasError ? "error.main" : "text.secondary", mb: 1 }} />
                      <Typography variant="caption" color={hasError ? "error.main" : "text.secondary"}>
                        JPG, PNG, PDF (Max 5MB)
                      </Typography>
                      {hasError && (
                        <Typography variant="caption" color="error.main" sx={{ mt: 1, fontWeight: 600 }}>
                          {t("profile.documentRequired")}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
              </Grid>
            );
          })}
        </Grid>

        {/* Add More Documents Button */}
        {canAddMore && totalDocs > 0 && (
          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">
              {t("profile.documentsCount", { count: totalDocs, max: maxDocs })}
            </Typography>
          </Box>
        )}

        {/* Empty State */}
        {totalDocs === 0 && (
          <Box
            sx={{
              textAlign: "center",
              py: 4,
              color: "text.secondary",
            }}
          >
            <Description sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
            <Typography>{t("profile.noDocuments")}</Typography>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #359364 0%, #24754f 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                boxShadow: "0 4px 12px rgba(53, 147, 100, 0.3)",
              }}
            >
              {isBusinessUser ? (
                <Business sx={{ fontSize: 32, color: "white" }} />
              ) : isDriverUser ? (
                <LocalShipping sx={{ fontSize: 32, color: "white" }} />
              ) : (
                <Person sx={{ fontSize: 32, color: "white" }} />
              )}
            </Box>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              {t("profile.completeProfile")}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t("profile.completeProfileSubtitle")}
            </Typography>
          </Box>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                "& .MuiTab-root": {
                  fontWeight: 600,
                  fontSize: "1rem",
                  textTransform: "none",
                },
                "& .Mui-selected": {
                  color: "primary.main",
                },
              }}
            >
              <Tab
                icon={<Person />}
                iconPosition={isRTL ? "end" : "start"}
                label={t("profile.profileInfoTab")}
              />
              <Tab
                icon={<Description />}
                iconPosition={isRTL ? "end" : "start"}
                label={t("profile.documentsTab")}
              />
            </Tabs>
          </Box>

          {/* Tab Panels */}
          <TabPanel value={activeTab} index={0}>
            {renderProfileInfoTab()}
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            {renderDocumentsTab()}
          </TabPanel>

          {/* Submit Button */}
          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              fullWidth
              size="large"
              endIcon={!isRTL && <CheckCircle />}
              startIcon={isRTL && <CheckCircle />}
              disabled={loading}
              onClick={handleFormSubmit}
              sx={{
                py: 1.5,
                fontSize: "1.1rem",
                fontWeight: 600,
                background: "linear-gradient(135deg, #359364 0%, #24754f 100%)",
                boxShadow: "0 4px 12px rgba(53, 147, 100, 0.3)",
                "&:hover": {
                  boxShadow: "0 6px 16px rgba(53, 147, 100, 0.4)",
                },
              }}
            >
              {loading ? t("profile.submitting") : t("profile.submitForReview")}
            </Button>
          </Box>

          {/* Info Box */}
          <Box
            sx={{
              mt: 3,
              p: 2.5,
              bgcolor: alpha("#359364", 0.04),
              borderRadius: 2,
              border: "1px solid",
              borderColor: alpha("#359364", 0.2),
            }}
          >
            <Typography variant="body2" color="text.secondary">
              <strong>{isRTL ? "הערה:" : "Note:"}</strong> {t("profile.profileNote")}
            </Typography>
          </Box>
        </Paper>
      </Container>

      {/* Image Preview Modal */}
      <ImageViewerModal
        open={!!previewImage}
        onClose={() => setPreviewImage(null)}
        imageUrl={previewImage?.url || ""}
        title={previewImage?.title}
        isDirectUrl={previewImage?.isDirectUrl}
      />
    </Box>
  );
};

export default ProfileCompletionPage;
