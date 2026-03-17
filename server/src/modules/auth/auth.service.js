import { User, ResetPassword } from "./auth.model.js";

const escapeRegex = (value = "") => {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const getEmailFilter = (email) => {
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();
  if (!normalizedEmail) {
    return null;
  }

  return {
    $regex: `^${escapeRegex(normalizedEmail)}$`,
    $options: "i",
  };
};

export const findUserByEmail = async (email) => {
  const emailFilter = getEmailFilter(email);
  if (!emailFilter) return null;

  let user = await User.findOne({ email: emailFilter });

  return user;
};

export const findUserByEmailForLogin = async (email) => {
  const emailFilter = getEmailFilter(email);
  if (!emailFilter) return null;

  return await User.findOne({ email: emailFilter });
};

export const createUser = async (data) => {
  const normalizedEmail = String(data?.email || "")
    .trim()
    .toLowerCase();

  return await User.create({
    ...data,
    email: normalizedEmail,
  });
};

export const createResetPasswordRecord = async (user) => {
  if (!user || !user._id || !user.email || !user.password) return null;

  return await ResetPassword.create({
    userId: user._id,
    email: user.email,
    password: user.password, // hashed password after save
    confirmPassword: user.password, // same as password
  });
};
