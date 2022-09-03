const cookieToken = (user, res) => {
  const token = user.getJwtToken();

  const cookieTime = process.env.COOKIE_TIME;

  const options = {
    expires: new Date(Date.now() + cookieTime * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  user.password = undefined;
  res.status(200).cookie("token", token, options).json({
    success: true,
    token,
    user,
  });
};

module.exports = cookieToken;
