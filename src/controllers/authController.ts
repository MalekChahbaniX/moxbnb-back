import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '@/models';
import { config } from '@/config/config';
import { ApiResponse } from '@/types';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, phone, role = 'GUEST' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      } as ApiResponse);
      return;
    }

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      phone,
      role
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn } as jwt.SignOptions
    );

    res.status(201).json({
      success: true,
      data: {
        token,
        refreshToken,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isVerified: user.isVerified
        }
      }
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error during registration'
    } as ApiResponse);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user with password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      } as ApiResponse);
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      res.status(401).json({
        success: false,
        error: 'Account is deactivated'
      } as ApiResponse);
      return;
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      } as ApiResponse);
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn } as jwt.SignOptions
    );

    res.status(200).json({
      success: true,
      data: {
        token,
        refreshToken,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isVerified: user.isVerified,
          avatar: user.avatar
        }
      }
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error during login'
    } as ApiResponse);
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        error: 'Refresh token is required'
      } as ApiResponse);
      return;
    }

    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as any;
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      } as ApiResponse);
      return;
    }

    // Generate new access token
    const newToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
    );

    const newRefreshToken = jwt.sign(
      { id: user._id },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn } as jwt.SignOptions
    );

    res.status(200).json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    } as ApiResponse);
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: 'Invalid refresh token'
    } as ApiResponse);
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // In a real implementation, you might want to blacklist the token
    // For now, we'll just return success
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error during logout'
    } as ApiResponse);
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    // User is already attached to request by auth middleware
    const user = (req as any).user;

    // Ensure user is defined (should be guaranteed by authMiddleware)
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User not found in request context'
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user
      }
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error fetching profile'
    } as ApiResponse);
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const updates = req.body;

    // Remove sensitive fields that shouldn't be updated directly
    delete updates.password;
    delete updates.role;
    delete updates.isVerified;
    delete updates.isActive;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user
      }
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error updating profile'
    } as ApiResponse);
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists for security
      res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      } as ApiResponse);
      return;
    }

    // TODO: Implement email sending with reset token
    // For now, just return success message
    
    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error processing forgot password'
    } as ApiResponse);
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    // TODO: Implement password reset with token validation
    // For now, just return success message
    
    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully'
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error resetting password'
    } as ApiResponse);
  }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;

    // TODO: Implement email verification with token
    // For now, just return success message
    
    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error verifying email'
    } as ApiResponse);
  }
};

export const resendVerification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      } as ApiResponse);
      return;
    }

    if (user.isVerified) {
      res.status(400).json({
        success: false,
        error: 'Email is already verified'
      } as ApiResponse);
      return;
    }

    // TODO: Implement email sending with verification token
    // For now, just return success message
    
    res.status(200).json({
      success: true,
      message: 'Verification email has been sent'
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error sending verification email'
    } as ApiResponse);
  }
};

export const authController = {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification
};
