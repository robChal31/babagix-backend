const { User } = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const { sendConfirmationEmail } = require("../helpers/nodemailer");

const registerUser = async (req, res) => {
  const { email, password } = req.body;
  const trimEmail = email.trim();
  if (!trimEmail || !password) {
    return res.status(401).json("e-mail & password harus diisi");
  }

  if (!validator.isEmail(trimEmail)) {
    return res.status(401).json("Format e-mail harus benar");
  }

  if (!validator.isStrongPassword(password)) {
    return res
      .status(401)
      .json(
        "Pasword harus terdiri dari kombinasi karakter huruf kecil, kapital,angka,karakter simbol dan panjang minimal 8 karakter"
      );
  }

  //email check
  const isUsedEmail = await User.findOne({ email: trimEmail });

  if (isUsedEmail) {
    return res.status(401).json("e-mail sudah terdaftar");
  }

  const baseUrl = "http://10.0.2.2:4000/public/avatar/";
  let avatarImage = `${baseUrl}maleDefaultAvatar.png`;

  if (req.body.gender == "Female") {
    avatarImage = `${baseUrl}femaleDefaultAvatar.png`;
  }

  if (password !== req.body.confirmPassword) {
    return res.status(400).json("password dan konfirmasi password harus sama");
  }

  const verifyToken = jwt.sign(
    { email: trimEmail },
    process.env.SECRET_JWT_REGISTER
  );

  const userCreated = new User({
    username: req.body.username,
    email: trimEmail,
    password: bcrypt.hashSync(password, 10),
    phone_number: req.body.phoneNumber,
    gender: req.body.gender,
    location: {
      latitude: req.body.latitude,
      longitude: req.body.longitude,
    },
    avatar: avatarImage,
    verifyToken,
  });

  userCreated
    .save()
    .then((saved) => {
      sendConfirmationEmail(saved.username, saved.email, saved.verifyToken);
      return res.status(200).json(saved);
    })
    .catch((err) => {
      return res.status(500).json({
        message: err,
        status: false,
      });
    });
};

const getUser = async (req, res) => {
  const userList = await User.find().populate("itemSaved");

  if (!userList) {
    return res.status(500).json("Something went wrong");
  }

  res.status(200).json(userList);
};

const loginUser = async (req, res) => {
  if (!validator.isEmail(req.body.email.trim())) {
    return res.status(400).json("format e-mail salah");
  }
  const user = await User.findOne({ email: req.body.email.trim() });
  if (!user) {
    return res.status(400).json("email belum terdaftar");
  }
  if (!user.verified) {
    return res
      .status(400)
      .json(
        "e-mail belum terverifikasi, cek kotak masuk e-mail untuk verifikasi."
      );
  }
  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    const token = jwt.sign(
      {
        userId: user._id,
        verified: user.verified,
      },
      process.env.SECRET_JWT,
      { expiresIn: "31d" }
    );
    res.status(200).json({ user, token });
  } else {
    res.status(400).json("Wrong Credential");
  }
};

const verifyUser = async (req, res) => {
  const token = jwt.verify(
    req.params.verifyToken,
    process.env.SECRET_JWT_REGISTER
  );

  const user = await User.find({ email: token.email });
  if (!user) {
    return res.status(400).json("user not registered");
  }

  if (user) {
    const userUpdate = User.findByIdAndUpdate(
      user[0]._id,
      {
        verified: true,
      },
      { new: true }
    )
      .then((data) =>
        res
          .status(200)
          .json("<h1>Akun anda sudah terverifikasi silahkan login kembali</h1>")
      )
      .catch((err) => res.status(500).json(err));
  }
};

const getSingleUser = async (req, res) => {
  const user = await User.findById(req.params.id).select("username bio avatar");
  if (!user) {
    return res.status(400).json("no user found");
  }
  if (user) {
    return res.status(200).json(user);
  }
};

const editUser = async (req, res) => {
  const { bio, username, phoneNumber } = req.body;
  console.log(bio, username, phoneNumber, req.params);
  console.log(req.file, "cek file");
  const updateUser = await User.findByIdAndUpdate(
    req.params.id,
    {
      username: username,
      bio: bio,
      phone_number: phoneNumber,
      avatar: `http://10.0.2.2:4000/public/avatar/${req.file.filename}`,
    },
    { new: true }
  );

  const token = jwt.sign(
    {
      userId: updateUser._id,
      verified: updateUser.verified,
    },
    process.env.SECRET_JWT,
    { expiresIn: "31d" }
  );

  if (updateUser) {
    return res.status(200).json({ user: updateUser, token });
  }
  if (!updateUser) {
    return res
      .status(500)
      .json({ status: false, message: '"profil gagal diperbarui"' });
  }
};

module.exports = {
  registerUser,
  getUser,
  loginUser,
  verifyUser,
  editUser,
  getSingleUser,
};
