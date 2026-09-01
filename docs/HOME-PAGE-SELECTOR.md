# Home Page Selector Feature

## Overview

The Home Page Selector allows administrators to choose which page should be displayed as the website's home page (root URL `/`). This feature provides a hierarchical dropdown showing all available pages from multiple collections.

## Features

- **Hierarchical Display**: Pages are shown with their parent-child relationships using indentation (similar to Grav CMS)
- **Multi-Collection Support**: Includes pages from:
  - Pages (with full hierarchy)
  - News Articles
  - Software Catalog
  - Projects
  - Trainings
  - Team Pages
- **Auto-Update**: Automatically fetches and displays newly created pages
- **Visual Organization**: Collections are separated with labeled dividers

## How to Use

### Setting the Home Page

1. Log in to the admin panel
2. Go to **Site Settings** in the left sidebar
3. Find the **Home Page** field
4. Click the dropdown to see all available pages organized hierarchically
5. Select the page you want as your home page
6. Click **Save**

### Dropdown Format

The dropdown displays pages in this format:

```
—► (slug) Page Title
```

- **Indentation** (`—`) shows hierarchy depth
- **Slug** (in parentheses) is the URL identifier
- **Page Title** is the display name

### Example

```
—► (home) Home
—► (about-us) About Mosai
———► (the-association) The Association
———► (presidents-message) President's Message
———► (managing-committee) Managing Committee
—► (japanese-language) Japanese Language
———► (about-institute) About Institute
─── NEWS ARTICLES ───
—► (campus-expansion-2025) Campus Expansion Announced
—► (new-software-matlab) New Software: MATLAB R2026a
─── SOFTWARE ───
—► (turnitin) Turnitin
—► (matlab) MATLAB
```

## Technical Details

### Files Created

1. **`src/components/admin/HomePageSelectorField.tsx`**
   - Custom React component for the hierarchical dropdown
   - Fetches pages from all collections via API
   - Builds hierarchy for Pages collection
   - Groups other collections under labeled separators

2. **`src/lib/getHomePage.ts`**
   - Utility function to retrieve the configured home page
   - Parses the stored value (format: `collection:identifier`)
   - Fetches the actual page data from the appropriate collection
   - Falls back to 'home' page if not configured

3. **Updated `src/globals/SiteSettings.ts`**
   - Added `homePage` field with custom component

4. **Updated `src/app/(frontend)/page.tsx`**
   - Uses `getHomePage()` utility to load the configured home page
   - Falls back to 'home' slug if not configured

### Data Format

The home page value is stored as a string in the format:

```
collection:identifier
```

Examples:
- `pages:home` — Page with slug "home"
- `news:campus-expansion-2025` — News article with slug "campus-expansion-2025"
- `software:123` — Software item with ID "123"
- `team-page:our-team` — Team page with slug "our-team"

### API Endpoints Used

The component fetches data from these endpoints:
- `/api/pages?limit=1000&depth=1`
- `/api/news?limit=1000`
- `/api/software?limit=1000`
- `/api/projects?limit=1000`
- `/api/trainings?limit=1000`
- `/api/team-page?limit=1000`

## Extending the Feature

### Adding More Collections

To add support for additional collections:

1. **Update `HomePageSelectorField.tsx`**:
   ```typescript
   const [newCollectionRes] = await Promise.all([
     // ... existing fetches
     fetch('/api/your-collection?limit=1000').then((r) => r.json()),
   ])

   // Add to allPages array
   if (newCollectionRes.docs && newCollectionRes.docs.length > 0) {
     allPages.push({
       label: '─── YOUR COLLECTION ───',
       value: '__your_collection_separator__',
       depth: 0,
       collection: 'separator',
     })
     newCollectionRes.docs.forEach((item: any) => {
       allPages.push({
         label: `—► (${item.slug}) ${item.title}`,
         value: `your-collection:${item.slug}`,
         depth: 1,
         collection: 'your-collection',
       })
     })
   }
   ```

2. **Update `getHomePage.ts`**:
   ```typescript
   case 'your-collection': {
     const item = await payload.find({
       collection: 'your-collection',
       where: {
         slug: {
           equals: identifier,
         },
       },
       limit: 1,
       depth: 2,
     })

     if (item.docs.length > 0) {
       return {
         collection: 'your-collection',
         slug: identifier,
         data: item.docs[0],
       }
     }
     break
   }
   ```

## Troubleshooting

### Dropdown is Empty
- Check that you have created at least one page
- Verify API endpoints are accessible
- Check browser console for errors

### Home Page Not Updating
- Ensure you clicked **Save** in Site Settings
- Clear browser cache and refresh
- Check that the selected page status is "Published"

### Hierarchy Not Showing Correctly
- Verify parent-child relationships in the Pages collection
- Check that parent pages exist and are not deleted
- Ensure no circular references (page A → parent B → parent A)

## Future Enhancements

Potential improvements:
- Search/filter functionality in the dropdown
- Show page status (Draft/Published) in the dropdown
- Preview button to see the page before setting as home
- Bulk operations (set multiple pages as home for different locales)
- Custom home page templates per collection type
