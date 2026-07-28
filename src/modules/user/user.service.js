import { asyncHandler } from "../../utils/asyncHandler.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { ApiError } from "../../utils/apiError.js";
import { User } from "./user.model.js";
import { registerSchema, loginSchema } from "./user.validation.js";

export const register = asyncHandler(async (req, res) => {
  const parsed = registerSchema.safeParse(req);
  if (!parsed.success) {
    throw new ApiError(
      400,
      parsed.error.errors.map((e) => e.message).join(", ")
    );
  }

  const { name, email, password, role } = parsed.data.body;
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, "Email already registered");

  const user = await User.create({ name, email, password, role });

  const responseUser = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
  return apiResponse(res, 201, "User registered successfully", responseUser);
});

export const login = asyncHandler(async (req, res) => {
  const parsed = loginSchema.safeParse(req);
  if (!parsed.success) {
    throw new ApiError(
      400,
      parsed.error.errors.map((e) => e.message).join(", ")
    );
  }

  const { email, password } = parsed.data.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid credentials");
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  return apiResponse(res, 200, "Login successful", {
    accessToken,
    refreshToken,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});
