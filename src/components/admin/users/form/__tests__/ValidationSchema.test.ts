
import { validateForm } from "../ValidationSchema";

// Mock the isValidCompanyEmail function
jest.mock("@/services/admin/company-users", () => ({
  isValidCompanyEmail: (email: string) => email.endsWith('@pazproperty.pt')
}));

describe("ValidationSchema", () => {
  it("should validate a valid form", () => {
    const result = validateForm({
      name: "John Doe",
      email: "john.doe@pazproperty.pt",
      password: "Password123"
    });

    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors).length).toBe(0);
  });

  it("should return errors for empty name", () => {
    const result = validateForm({
      name: "",
      email: "john.doe@pazproperty.pt",
      password: "Password123"
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.name).toBe("Le nom est requis");
  });

  it("should return errors for empty email", () => {
    const result = validateForm({
      name: "John Doe",
      email: "",
      password: "Password123"
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.email).toBe("L'email est requis");
  });

  it("should return errors for invalid company email", () => {
    const result = validateForm({
      name: "John Doe",
      email: "john.doe@gmail.com",
      password: "Password123"
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.email).toBe("L'email doit être une adresse @pazproperty.pt");
  });

  it("should return errors for empty password", () => {
    const result = validateForm({
      name: "John Doe",
      email: "john.doe@pazproperty.pt",
      password: ""
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.password).toBe("Le mot de passe est requis");
  });

  it("should return errors for password too short", () => {
    const result = validateForm({
      name: "John Doe",
      email: "john.doe@pazproperty.pt",
      password: "short"
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.password).toBe("Le mot de passe doit comporter au moins 8 caractères");
  });
});
