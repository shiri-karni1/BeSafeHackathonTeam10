import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * Validation Note:
 * Mongoose throws a 'ValidationError' if required fields are missing or rules are violated.
 * These errors are caught in the controller and processed by 'handleAuthError' in helpers.js,
 * which returns the custom error messages defined below (e.g., 'Username is required').
 */
const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: [true, 'Username is required'], 
    unique: true,
    minlength: [6, 'Username must be at least 6 characters long']
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

/**
 * Pre-save hook to hash the password before saving to the database.
 * This ensures that plain text passwords are never stored.
 */
userSchema.pre('save', async function () {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return;
  }
  
  // Generate a salt and hash the password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

export default User;
