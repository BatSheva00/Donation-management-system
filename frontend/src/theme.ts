import { createTheme, alpha } from "@mui/material/styles";

export const createAppTheme = (direction: "ltr" | "rtl" = "ltr") =>
  createTheme({
    direction,
    palette: {
      primary: {
        main: "#359364",
        light: "#58ad81",
        dark: "#24754f",
        contrastText: "#fff",
      },
      secondary: {
        main: "#f97316",
        light: "#fb923c",
        dark: "#ea580c",
        contrastText: "#fff",
      },
      error: {
        main: "#ef4444",
        light: "#f87171",
        dark: "#dc2626",
      },
      warning: {
        main: "#f59e0b",
        light: "#fbbf24",
        dark: "#d97706",
      },
      info: {
        main: "#3b82f6",
        light: "#60a5fa",
        dark: "#2563eb",
      },
      success: {
        main: "#10b981",
        light: "#34d399",
        dark: "#059669",
      },
      background: {
        default: "#f8fafc",
        paper: "#ffffff",
      },
      text: {
        primary: "#1e293b",
        secondary: "#64748b",
      },
    },
    typography: {
      fontFamily: '"Inter", "Rubik", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontFamily: '"Poppins", "Rubik", sans-serif',
        fontWeight: 800,
        fontSize: "3.5rem",
        letterSpacing: "-0.02em",
        lineHeight: 1.2,
      },
      h2: {
        fontFamily: '"Poppins", "Rubik", sans-serif',
        fontWeight: 700,
        fontSize: "2.5rem",
        letterSpacing: "-0.01em",
        lineHeight: 1.3,
      },
      h3: {
        fontFamily: '"Poppins", "Rubik", sans-serif',
        fontWeight: 600,
        fontSize: "2rem",
        lineHeight: 1.4,
      },
      h4: {
        fontFamily: '"Poppins", "Rubik", sans-serif',
        fontWeight: 600,
        fontSize: "1.5rem",
        lineHeight: 1.5,
      },
      h5: {
        fontFamily: '"Poppins", "Rubik", sans-serif',
        fontWeight: 600,
        fontSize: "1.25rem",
        lineHeight: 1.5,
      },
      h6: {
        fontFamily: '"Poppins", "Rubik", sans-serif',
        fontWeight: 600,
        fontSize: "1rem",
        lineHeight: 1.6,
      },
      button: {
        fontWeight: 600,
        letterSpacing: "0.02em",
      },
    },
    shape: {
      borderRadius: 12,
    },
    shadows: [
      "none",
      "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
      "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
      "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
      "0 25px 50px -12px rgb(0 0 0 / 0.25)",
      "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
      "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
      "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
      "0 25px 50px -12px rgb(0 0 0 / 0.25)",
      "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
      "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
      "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
      "0 25px 50px -12px rgb(0 0 0 / 0.25)",
      "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
      "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
      "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
      "0 25px 50px -12px rgb(0 0 0 / 0.25)",
      "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
      "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    ],
    components: {
       MuiButton: {
         styleOverrides: {
           root: {
             textTransform: "none",
             fontWeight: 600,
             borderRadius: 10,
             padding: "10px 24px",
             fontSize: "0.95rem",
             boxShadow: "none",
             transition: "all 0.3s ease",
             display: "inline-flex",
             alignItems: "center",
             justifyContent: "center",
             gap: 8,
             "&:hover": {
               transform: "translateY(-2px)",
               boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
             },
           },
           contained: {
             "&:hover": {
               boxShadow: "0 6px 20px rgba(0, 0, 0, 0.2)",
             },
           },
           sizeLarge: {
             padding: "12px 32px",
             fontSize: "1rem",
           },
           endIcon: {
             margin: 0,
           },
           startIcon: {
             margin: 0,
           },
         },
       },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow:
              "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
            transition: "all 0.3s ease",
            "&:hover": {
              boxShadow:
                "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
              transform: "translateY(-4px)",
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: 10,
              transition: "all 0.3s ease",
              "&:hover": {
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: alpha("#359364", 0.5),
                },
              },
              "&.Mui-focused": {
                "& .MuiOutlinedInput-notchedOutline": {
                  borderWidth: 2,
                },
              },
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 16,
          },
          elevation: {
            boxShadow:
              "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
            backdropFilter: "blur(8px)",
            backgroundColor: alpha("#ffffff", 0.8),
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 500,
          },
        },
      },
    },
    transitions: {
      duration: {
        shortest: 150,
        shorter: 200,
        short: 250,
        standard: 300,
        complex: 375,
        enteringScreen: 225,
        leavingScreen: 195,
      },
      easing: {
        easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
        easeOut: "cubic-bezier(0.0, 0, 0.2, 1)",
        easeIn: "cubic-bezier(0.4, 0, 1, 1)",
        sharp: "cubic-bezier(0.4, 0, 0.6, 1)",
      },
    },
  });

export const theme = createAppTheme("ltr");
