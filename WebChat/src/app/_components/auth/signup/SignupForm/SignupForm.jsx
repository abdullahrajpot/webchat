import LoadingButton from "@mui/lab/LoadingButton";
import {
  JumboForm,
  JumboInput,
  JumboOutlinedInput,
} from "@jumbo/vendors/react-hook-form";
import { customValidation } from "../validation";
import { IconButton, InputAdornment, Stack, Typography } from "@mui/material";
import React from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

// Validation resolver
const customResolver = () => async (values) => {
  const errors = customValidation(values);
  return {
    values: Object.keys(errors).length === 0 ? values : {},
    errors: Object.fromEntries(
      Object.entries(errors).map(([key, message]) => [
        key,
        { type: "manual", message },
      ]),
    ),
  };
};

const SignupForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  async function handleSignup(data) {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
      };

      await axios.post("http://localhost:5001/api/users/register", payload);

      toast.success("User registered successfully");
      setSuccess("Registration successful! You can now log in.");

      setTimeout(() => navigate("/auth/login-1"), 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed.");
      toast.error("Registration error!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <JumboForm
      resolver={customResolver()}
      onSubmit={handleSignup}
      defaultValues={{
        name: "",
        email: "",
        password: "",
      }}
    >
      <Stack spacing={3} mb={3}>
        <JumboInput
          fullWidth
          fieldName="name"
          label={t("Name")}
        />
        <JumboInput
          fullWidth
          fieldName="email"
          label={t("Email")}
        />
        <JumboOutlinedInput
          fieldName="password"
          label={t("Password")}
          type={showPassword ? "text" : "password"}
          endAdornment={
            <InputAdornment position="end">
              <IconButton onClick={handleClickShowPassword} edge="end">
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          }
          sx={{ bgcolor: (theme) => theme.palette.background.paper }}
        />

        {error && <Typography color="error">{error}</Typography>}
        {success && <Typography color="success.main">{success}</Typography>}

        <LoadingButton
          fullWidth
          type="submit"
          variant="contained"
          size="large"
          loading={loading}
        >
          {t("Register")}
        </LoadingButton>
      </Stack>
    </JumboForm>
  );
};

export { SignupForm };
