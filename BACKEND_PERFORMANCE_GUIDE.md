# Backend Performance Optimization Guide

## Current Issues
Based on server logs, backend response times are too slow:
- `/api/me` takes 1-3 seconds (sometimes even 3s+)
- `/api/login` takes 3-4 seconds
- Multiple redundant API calls happening

## Root Causes
1. **N+1 Database Queries** - Each request makes multiple queries instead of eager loading
2. **Missing Database Indexes** - Queries are doing full table scans
3. **No Response Caching** - Same data fetched multiple times
4. **Inefficient Relationships** - Models loading too much related data

## Frontend Optimizations (Already Done ✅)
- ✅ Added AUTH_CONTEXT to cache user data
- ✅ Added REQUEST DEDUPLICATION to avoid duplicate API calls
- ✅ Added REQUEST TIMEOUT (30s) to prevent infinite buffering
- ✅ Added CACHED USER DATA to show instantly while fetching fresh data

## Backend Optimizations (TODO ⚠️)

### 1. Optimize `/api/me` Endpoint
**File:** `app/Http/Controllers/AuthController.php` or wherever the ME endpoint is

```php
// Use eager loading to avoid N+1 queries
public function me()
{
    $user = Auth::user()->load(['roles', 'permissions']);
    return response()->json(['data' => $user]);
}
```

### 2. Add Database Indexes
**File:** `database/migrations/`

```php
// Indexes that should exist:
- users.email (for login queries)
- users.id (usually automatic)
- roles.id
- permissions.id
- user_role pivot table indexes
```

### 3. Implement Query Caching
**Option A - Redis Caching**
```php
// Cache user data for 1 hour
public function me()
{
    $user = Cache::remember('user.' . Auth::id(), 3600, function() {
        return Auth::user()->load(['roles', 'permissions']);
    });
    return response()->json(['data' => $user]);
}
```

**Option B - Model Query Optimization**
```php
// Use select() to get only needed columns
public function me()
{
    $user = Auth::user()
        ->select('id', 'name', 'email', 'created_at')
        ->with('roles:id,name', 'permissions:id,name')
        ->first();
    return response()->json(['data' => $user]);
}
```

### 4. Add Response Compression
**File:** `.htaccess` or `nginx.conf`
```
gzip on;
gzip_types application/json text/plain;
```

### 5. Optimize `/api/login` Endpoint
- Pre-hash comparison should be fast
- Clear any cache that might be slowing things down
- Use `firstOrFail()` instead of `where()->first()`

### 6. Use Laravel Debugbar in Development
```bash
composer require barryvdh/laravel-debugbar --dev
```
This will show query times and help identify bottlenecks.

## Performance Targets
- `/api/me` should be < 100ms (currently 1000-3000ms)
- `/api/login` should be < 500ms (currently 3000-4000ms)
- API responses should be < 50ms for cached data

## Testing Performance
After optimizations, use Chrome DevTools Network tab to verify response times improved.
