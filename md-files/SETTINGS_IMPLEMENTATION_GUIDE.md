# Settings Page Implementation Guide

## Overview
This document describes the comprehensive settings page implementation with all requested features including referral system, daily claims, streak tracking, account deletion, and blacklist management.

## 🎯 **Features Implemented**

### 1. **Profile Management**
- Update full name
- View account information
- Display credits and membership status
- Email display (read-only)

### 2. **Referral System**
- Generate unique referral codes
- Apply referral codes from other users
- Track referral statistics
- Earn credits for both referrer and referred user (5 credits each)

### 3. **Daily Rewards**
- Daily bonus claim system (2 credits per day)
- One-time claim per day
- Visual feedback for claimed status
- Automatic tracking of last claim date

### 4. **Streak System**
- Track daily login streaks
- Display current and longest streaks
- Streak-based rewards system
- Visual progress indicators

### 5. **Account Deletion**
- Complete account deletion from Supabase
- Account deletion from Clerk
- Blacklist prevention system
- Data cleanup across all tables

### 6. **Blacklist System**
- Prevent deleted users from re-registering
- Track deletion reasons
- Block credit abuse attempts

## 📁 **File Structure**

```
app/
├── dashboard/
│   └── settings/
│       └── page.tsx                 # Main settings page component
├── api/
│   ├── referral/
│   │   ├── apply/route.ts          # Apply referral code
│   │   └── stats/route.ts          # Get referral statistics
│   └── user/
│       ├── update-profile/route.ts # Update user profile
│       ├── daily-bonus/route.ts    # Daily bonus claim
│       ├── streak/route.ts         # Streak management
│       ├── delete-account/route.ts # Account deletion
│       └── check-blacklist/route.ts # Blacklist checking
scripts/
├── create_user_streaks_table.sql   # Streak table migration
├── create_blacklist_table.sql      # Blacklist table migration
└── update_users_table_referrals.sql # User table updates
```

## 🗄️ **Database Schema**

### **Users Table Updates**
```sql
-- New columns added to users table
ALTER TABLE public.users ADD COLUMN referral_id TEXT UNIQUE;
ALTER TABLE public.users ADD COLUMN referred_by TEXT;
ALTER TABLE public.users ADD COLUMN referral_count INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN referral_credits_earned INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN last_daily_bonus_date DATE;
```

### **User Streaks Table**
```sql
CREATE TABLE public.user_streaks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    streak_rewards_claimed JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);
```

### **Blacklist Table**
```sql
CREATE TABLE public.deleted_users_blacklist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    user_id TEXT,
    reason TEXT NOT NULL DEFAULT 'account_deletion',
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔧 **API Endpoints**

### **Profile Management**
- `POST /api/user/update-profile` - Update user profile information

### **Referral System**
- `POST /api/referral/apply` - Apply a referral code
- `GET /api/referral/stats` - Get referral statistics

### **Daily Rewards**
- `POST /api/user/daily-bonus` - Claim daily bonus credits

### **Streak System**
- `GET /api/user/streak` - Get current streak data
- `POST /api/user/streak` - Update streak (called on login)

### **Account Management**
- `DELETE /api/user/delete-account` - Delete user account
- `POST /api/user/check-blacklist` - Check if email is blacklisted

## 🎨 **UI Components**

### **Settings Page Tabs**
1. **Profile Tab**
   - Personal information editing
   - Account information display
   - Credits and membership status

2. **Referrals Tab**
   - Referral code display and copying
   - Apply referral code form
   - Referral statistics

3. **Rewards Tab**
   - Daily bonus claim button
   - Claim status display
   - Reward information

4. **Streak Tab**
   - Current streak display
   - Streak progress bar
   - Streak rewards system
   - Longest streak tracking

5. **Danger Zone Tab**
   - Account deletion form
   - Confirmation input
   - Warning messages

## 🔒 **Security Features**

### **Authentication**
- All endpoints require Clerk authentication
- User ID validation on all operations
- Service role access for database operations

### **Data Protection**
- RLS policies on all tables
- Input validation and sanitization
- Error handling and logging

### **Blacklist Prevention**
- Email-based blacklisting
- Prevents re-registration abuse
- Tracks deletion reasons

## 📊 **Credit System Integration**

### **Referral Credits**
- 5 credits for referrer
- 5 credits for referred user
- Automatic credit distribution
- Transaction logging

### **Daily Bonus**
- 2 credits per day
- One-time claim per day
- Date-based tracking

### **Streak Rewards**
- 3 days: 2 credits
- 7 days: 3 credits
- 14 days: 5 credits
- 30 days: 10 credits

## 🚀 **Usage Examples**

### **Apply Referral Code**
```typescript
const response = await fetch('/api/referral/apply', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ referralCode: 'REF123456' })
})
```

### **Claim Daily Bonus**
```typescript
const response = await fetch('/api/user/daily-bonus', {
  method: 'POST'
})
```

### **Update Streak**
```typescript
const response = await fetch('/api/user/streak', {
  method: 'POST'
})
```

### **Delete Account**
```typescript
const response = await fetch('/api/user/delete-account', {
  method: 'DELETE'
})
```

## 🔄 **Data Flow**

### **Referral Process**
1. User applies referral code
2. System validates code and user eligibility
3. Updates both users' referral status
4. Creates referral record
5. Distributes credits to both users
6. Updates referral statistics

### **Daily Bonus Process**
1. User clicks claim button
2. System checks if already claimed today
3. Awards 2 credits if eligible
4. Updates last claim date
5. Records transaction

### **Streak Process**
1. User logs in (streak update called)
2. System checks last activity date
3. Increments streak if consecutive
4. Resets streak if gap found
5. Updates longest streak if needed

### **Account Deletion Process**
1. User confirms deletion
2. System deletes all user data from Supabase
3. Adds user to blacklist
4. Deletes user from Clerk
5. Returns success confirmation

## 🛠️ **Setup Instructions**

### **1. Run Database Migrations**
```bash
# Apply the SQL migrations to your Supabase database
psql -h your-db-host -U postgres -d your-db-name -f scripts/create_user_streaks_table.sql
psql -h your-db-host -U postgres -d your-db-name -f scripts/create_blacklist_table.sql
psql -h your-db-host -U postgres -d your-db-name -f scripts/update_users_table_referrals.sql
```

### **2. Environment Variables**
```bash
# Required environment variables
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
CLERK_SECRET_KEY=your-clerk-secret-key
```

### **3. Install Dependencies**
```bash
npm install sonner  # For toast notifications
```

## 🧪 **Testing**

### **Manual Testing Checklist**
- [ ] Profile update works correctly
- [ ] Referral code generation and application
- [ ] Daily bonus claim (once per day)
- [ ] Streak tracking and rewards
- [ ] Account deletion (test with dummy account)
- [ ] Blacklist prevention works
- [ ] All API endpoints respond correctly
- [ ] UI components render properly
- [ ] Error handling works
- [ ] Loading states display correctly

### **Test Scenarios**
1. **Referral Flow**: Create two accounts, apply referral code
2. **Daily Bonus**: Claim bonus, verify one-time limit
3. **Streak System**: Login multiple days, check streak increment
4. **Account Deletion**: Delete account, verify blacklist entry
5. **Blacklist Test**: Try to register with deleted email

## 📈 **Performance Considerations**

### **Database Optimization**
- Indexes on frequently queried columns
- Efficient RLS policies
- Proper foreign key relationships

### **API Optimization**
- Minimal database queries
- Proper error handling
- Transaction-like operations for data consistency

### **UI Optimization**
- Lazy loading of components
- Efficient state management
- Proper loading states

## 🔮 **Future Enhancements**

### **Potential Improvements**
1. **Advanced Streak Rewards**: More reward tiers
2. **Referral Analytics**: Detailed referral tracking
3. **Notification System**: Email/SMS notifications
4. **Admin Panel**: Manage blacklist and users
5. **Audit Logging**: Track all user actions
6. **Rate Limiting**: Prevent API abuse
7. **Caching**: Cache frequently accessed data

### **Additional Features**
1. **Social Features**: Share achievements
2. **Gamification**: Badges and achievements
3. **Leaderboards**: Top referrers and streaks
4. **Analytics Dashboard**: User behavior insights

## 🐛 **Troubleshooting**

### **Common Issues**
1. **Referral Code Not Working**: Check if user already has referral
2. **Daily Bonus Not Claiming**: Verify date comparison logic
3. **Streak Not Updating**: Check streak update timing
4. **Account Deletion Failing**: Verify Clerk permissions
5. **Blacklist Not Working**: Check email normalization

### **Debug Steps**
1. Check browser console for errors
2. Verify API responses
3. Check database logs
4. Test with different user accounts
5. Verify environment variables

## 📝 **Conclusion**

The settings page implementation provides a comprehensive user management system with all requested features:

✅ **Referral System**: Complete referral code generation and application
✅ **Daily Claims**: Daily bonus system with one-time claim limit
✅ **Streak System**: Daily streak tracking with rewards
✅ **Account Deletion**: Complete account removal from all systems
✅ **Blacklist System**: Prevention of credit abuse through re-registration
✅ **Profile Management**: User profile editing and information display

The implementation follows best practices for security, performance, and user experience while providing a robust foundation for future enhancements.
