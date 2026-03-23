const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Tạo access token và refresh token
const generateAccessToken = (user) => {
    return jwt.sign(
        { userId: user._id, email: user.email, role: user.role, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_ACCESS_EXPIRE || "15m" }
    );
};

const generateRefreshToken = (user) => {
    return jwt.sign(
        { userId: user._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRE || "7d" }
    );
};

// Đăng ký người dùng mới
const register = async (req, res) => {
    const { name, email, password, role, phone } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(409).json({
            success: false,
            message: "Email already registered",
        });
    }

    const user = await User.create({ name, email, password, role, phone });

    const accessToken = generateAccessToken(user);
    const refreshTokenStr = generateRefreshToken(user);

    res.status(201).json({
        success: true,
        message: "Registration successful",
        data: {
            user: user.toPublicJSON(),
            accessToken,
            refreshToken: refreshTokenStr,
        },
    });
};

// Đăng nhập
const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Invalid email or password",
        });
    }

    if (!user.isActive) {
        return res.status(403).json({
            success: false,
            message: "Account has been deactivated",
        });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        return res.status(401).json({
            success: false,
            message: "Invalid email or password",
        });
    }

    const accessToken = generateAccessToken(user);
    const refreshTokenStr = generateRefreshToken(user);

    res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
            user: user.toPublicJSON(),
            accessToken,
            refreshToken: refreshTokenStr,
        },
    });
};


// Refresh token
const refreshToken = async (req, res) => {
    const { refreshToken: token } = req.body;

    if (!token) {
        return res.status(400).json({
            success: false,
            message: "Refresh token is required",
        });
    }
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired refresh token",
        });
    }
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
        return res.status(401).json({
            success: false,
            message: "User not found or inactive",
        });
    }
    const newAccessToken = generateAccessToken(user);

    res.status(200).json({
        success: true,
        message: "Token refreshed",
        data: { accessToken: newAccessToken },
    });
};

// Lấy thông tin người dùng hiện tại
const getMe = async (req, res) => {
    const user = await User.findById(req.user.userId);
    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
    }

    res.status(200).json({
        success: true,
        data: { user: user.toPublicJSON() },
    });
};

// Xác thực token cho API Gateway (internal endpoint)
const verifyToken = async (req, res) => {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user || !user.isActive) {
        return res.status(401).json({
            success: false,
            message: "User not found or inactive",
        });
    }

    res.status(200).json({
        success: true,
        data: {
            userId: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
        },
    });
};

module.exports = { register, login, refreshToken, getMe, verifyToken };
