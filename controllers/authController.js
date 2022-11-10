const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const handleLogin = async (req, res) => {
  const { user, pwd } = req.body;
  if (!user || !pwd) return res.status(400).json({ message: "username and password are required." });

  const foundUser = await User.findOne({ username: user }).exec();

  if (!foundUser) return res.sendStatus(401); //unauthorized
  // evaluate password
  const match = await bcrypt.compare(pwd, foundUser.password);
  if (match) {
    // Check roles
    //const roles = Object.values(roles)
    // create and send a JWTs
    const accessToken = jwt.sign(
      {
        UserInfo: {
          username: foundUser.username,
          roles: foundUser.roles,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "30s" }
    );
    const refreshToken = jwt.sign({ username: foundUser.username }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "1d" });
    // Saving refreshToken with current user
    foundUser.refreshToken = refreshToken;
    const result = await foundUser.save();
    console.log(result);
    const { firstname, lastname, email, id, company, title, picture } = foundUser;
    const userInfos = { firstname, lastname, email, id, company, title, picture };
    //send token & cookie
    //1day ⚠️ http only make it not accessible with javascript
    res.cookie("jwt", refreshToken, { httpOnly: true, sameSite: "None", maxAge: 24 * 60 * 60 * 1000 }); //inProd add {secure: true,}
    await res.json({ accessToken, userInfos });
  } else {
    res.sendStatus(401);
  }
};

const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(401);
  const refreshToken = cookies.jwt;

  const foundUser = await User.findOne({ refreshToken }).exec();
  if (!foundUser) return res.sendStatus(403); //forbidden
  // evaluate pjwt
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err || foundUser.username !== decoded.username) return res.sendStatus(403);
    const roles = Object.values(foundUser.roles);
    const accessToken = jwt.sign(
      {
        UserInfo: {
          username: decoded.username,
          roles: roles,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "30s" }
    );
    res.json({ accessToken });
  });
};

const handleLogout = async (req, res) => {
  // On client, also delete the access token

  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); // No content to send back
  const refreshToken = cookies.jwt;

  //is refreshToken in DB?
  const foundUser = await User.findOne({ refreshToken }).exec();
  if (!foundUser) {
    res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
    return res.sendStatus(204);
  }
  // Delete refreshToken in db
  foundUser.refreshToken = "";
  const result = await foundUser.save();
  console.log(result);

  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
  res.sendStatus(204);
};

module.exports = { handleLogin, handleRefreshToken, handleLogout };
