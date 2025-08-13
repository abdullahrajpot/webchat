export function customValidation(values, isFirstUser) {
  const errors = {};

  if (!values.name || values.name.trim() === "") {
    errors.name = "Name is required";
  }
  if (!values.email || !/^[^@]+@[^@]+\.[^@]+$/.test(values.email)) {
    errors.email = "Enter a valid email";
  }
  if (!values.password) {
    errors.password = "Enter your password";
  }

  return errors;
}
