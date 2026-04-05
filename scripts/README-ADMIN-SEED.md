# Admin Accounts Seed

This script creates three admin accounts with different roles for the Moxbnb platform.

## 🔧 Important Note - Password Hashing

The User model includes a pre-save middleware that automatically hashes passwords. Therefore, the seed script provides plain text passwords which are automatically hashed by the User model. **Do not manually hash passwords in the seed script** as this would cause double hashing and login failures.

## Accounts Created

1. **Admin Account**
   - Email: `malek-admin@moxbnb.com`
   - Password: `password123`
   - Role: `ADMIN`

2. **Provider Account**
   - Email: `malek-provider@moxbnb.com`
   - Password: `password123`
   - Role: `PROVIDER`

3. **Host Account**
   - Email: `malek-host@moxbnb.com`
   - Password: `password123`
   - Role: `HOST`

## Usage

### Standard Seed (Safe Mode)
```bash
npm run seed:admin
```
- Checks if accounts already exist
- Stops if any of the emails are already in use
- Safe for repeated runs

### Force Seed (Overwrite Existing)
```bash
npm run seed:admin:force
```
- Deletes any existing accounts with the same emails
- Creates fresh accounts
- Use when you want to reset the admin accounts

## Features

- ✅ Password hashing with bcrypt
- ✅ Duplicate email checking
- ✅ Force delete option
- ✅ Proper error handling
- ✅ MongoDB connection management
- ✅ Default user settings configuration

## Notes

- All accounts are verified and active by default
- Default language is set to French (fr)
- Default currency is Tunisian Dinar (TND)
- Phone numbers are set for each account
- All accounts have proper user settings configured
