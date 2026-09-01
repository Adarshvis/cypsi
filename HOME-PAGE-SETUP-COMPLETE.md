# Home Page Selector - Setup Complete! ✅

The home page selector feature has been successfully installed.

## What Was Added

### 1. Database Column
- Added `home_page` column to `site_settings` table
- Stores the selected home page in format: `collection:identifier`

### 2. Admin Component
- **File:** `src/components/admin/HomePageSelectorField.tsx`
- Custom dropdown field showing all pages hierarchically
- Auto-fetches pages from all collections

### 3. Utility Function
- **File:** `src/lib/getHomePage.ts`
- Retrieves the configured home page data
- Falls back to 'home' slug if not configured

### 4. Updated Files
- `src/globals/SiteSettings.ts` - Added home page field
- `src/app/(frontend)/page.tsx` - Uses the home page selector
- `docs/CONTENT-MANAGEMENT-GUIDE.md` - Updated documentation
- `docs/HOME-PAGE-SELECTOR.md` - Feature documentation

## How to Use

1. **Restart your development server** (if it's still running)
   ```bash
   npm run dev
   ```

2. **Log in to the admin panel**
   - Go to `http://localhost:3666/admin`

3. **Open Site Settings**
   - Click "Site Settings" in the left sidebar

4. **Select Your Home Page**
   - Find the "Home Page" dropdown
   - You'll see all your pages organized hierarchically:
     ```
     —► (home) Home
     —► (about-us) About Us
     ———► (team) Our Team
     ─── NEWS ARTICLES ───
     —► (latest-news) Latest News
     ─── SOFTWARE ───
     —► (matlab) MATLAB
     ```
   - Select the page you want as your home page
   - Click **Save**

5. **Test It**
   - Go to `http://localhost:3666/`
   - You should see the page you selected

## Features

✅ **Hierarchical Display** - Pages shown with parent-child relationships  
✅ **Multi-Collection Support** - Includes Pages, News, Software, Projects, Trainings, Team Pages  
✅ **Auto-Update** - Automatically shows newly created pages  
✅ **Visual Organization** - Collections separated with labeled dividers  
✅ **Fallback** - Defaults to 'home' page if nothing selected  

## Troubleshooting

### Dropdown is empty
- Make sure you have created at least one page
- Check browser console for errors

### Changes not reflecting
- Clear browser cache (Ctrl+Shift+R)
- Restart the development server
- Verify the page status is "Published"

### Database error
If you see "column home_page does not exist":
```bash
psql -U postgres -d DUCC -c "ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS home_page TEXT;"
```

## Next Steps

- Create your pages in the Pages collection
- Set your preferred home page in Site Settings
- Customize the home page content using blocks

For more details, see `docs/HOME-PAGE-SELECTOR.md`
