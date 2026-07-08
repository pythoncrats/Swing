// Generates a 6-digit numeric OTP code as a string, e.g. "042817"
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = generateOtp;
