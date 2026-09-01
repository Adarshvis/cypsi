# Content Management Guide

**Your complete, step-by-step guide to updating every part of the website from the Admin Panel.**

No coding knowledge needed. If you can use a word processor, you can manage this site.

---

## Table of Contents

1. [How to Login](#1-how-to-login)
2. [Admin Panel Overview](#2-admin-panel-overview)
3. [Site Settings (Theme, Fonts, Colors, Social Links)](#3-site-settings)
4. [Header &amp; Top Bar](#4-header--top-bar)
5. [Navigation Menu](#5-navigation-menu)
6. [CTA Button (e.g. "Apply Now")](#6-cta-button)
7. [Footer](#7-footer)
8. [Pages (Home, About, and All Other Pages)](#8-pages)
9. [Building Pages with Blocks (The Fun Part)](#9-building-pages-with-blocks)
10. [News Articles](#10-news-articles)
11. [Software Catalog](#11-software-catalog)
12. [Projects](#12-projects)
13. [Trainings](#13-trainings)
14. [Team / People Pages](#14-team--people-pages)
15. [Individual People Profiles](#15-individual-people-profiles)
16. [Software Requests (Applications)](#16-software-requests)
17. [Media Library (Images &amp; Files)](#17-media-library)
18. [Forms](#18-forms)
19. [User Management](#19-user-management)
20. [Roles &amp; Permissions Explained](#20-roles--permissions-explained)
21. [Tips &amp; Common Questions](#21-tips--common-questions)

---


## 1. How to Login

1. Open your browser and go to **your-website-address/admin**
   - For example: `https://yoursite.edu/admin`
2. You will see a login screen. Enter your **Email** and **Password**.
3. Click **Login**.

> **Forgot your password?** Contact your Super Admin — they can reset it for you from the Users section.

After logging in, you land on the **Dashboard**. This is your home base. You will see a left sidebar with all the sections you can manage.

---

## 2. Admin Panel Overview

Once you are logged in, look at the **left sidebar**. Everything is organized into groups:

### Site Configuration
- **Site Settings** — Change the site name, theme, colors, fonts, and social media links
- **Header** — Edit the top bar, logos, navigation menu, search bar, and the CTA button
- **Footer** — Edit footer columns, links, logos, contact info, and copyright text

### Content
- **Pages** — All your website pages (Home, About, Services, etc.)
- **News** — News articles and announcements
- **Software** — The software catalog (licenses, descriptions, categories)
- **Projects** — IT projects with progress tracking
- **Trainings** — Training programmes and workshops
- **Team Pages** — Team/faculty listing pages with member profiles

### Admin
- **Users** — Manage who can log in and what they can do

### Media
- **Media** — All your uploaded images and files

> **Tip:** You do not need to touch everything. Most day-to-day work is just editing Pages and News.

---

## 3. Site Settings

**Who can access:** Super Admin only

This is where you control the overall look and feel of the entire website.

### How to get there
Click **Site Settings** in the left sidebar.

### 3.1 Change the Site Name
- Find the **Site Name** field at the top
- Type your organization name (e.g., "Digital University Computing Centre")
- Click **Save** at the top right

### 3.2 Change the Favicon (Browser Tab Icon)
- Scroll to the **Favicon** field
- Click **Upload** or select an existing image from the Media Library
- Use a small square image (recommended: 32×32px or 64×64px)
- Click **Save**

### 3.3 Set the Home Page
This powerful feature lets you choose which page should be your website's home page (what visitors see when they go to your main URL).

- Find the **Home Page** field
- Click the dropdown to see all your pages organized hierarchically
- Pages are shown with indentation to show parent-child relationships:
  - `—► (home) Home` — top-level page
  - `———► (about) About Us` — child page (nested under another page)
- You can select pages from:
  - **Pages** — Your main content pages
  - **News Articles** — Any news article
  - **Software** — Software catalog items
  - **Projects** — Project pages
  - **Trainings** — Training programme pages
  - **Team Pages** — Team/faculty pages
- Select the page you want as your home page
- Click **Save**

> **Example:** If you select "(about-us) About Us", visitors going to your main website URL will see the About Us page instead of the default Home page.

> **Default:** If you don't select anything, the system will use the page with slug "home" as the home page.

### 3.4 Switch the Entire Theme (One-Click)
This is a powerful feature. You can change the entire look of the site with one dropdown.

- Find **Theme Preset**
- Choose from:
  - **Theme A (Purple & Gold)** — elegant, university-style
  - **Theme B (Teal & Dark)** — modern, tech-focused
- Click **Save**

> **What happens:** When you switch themes, the system automatically updates all colors, fonts, and even the layout styles of blocks across the entire site. You do not need to change anything else.

### 3.4 Change Fonts
If you want to customize fonts beyond the theme preset:

- **Heading Font** — Used for all headings (page titles, section titles). Options include:
  - Playfair Display (Serif — classic, elegant)
  - Raleway, Montserrat, Inter, Roboto, Poppins (Sans — modern, clean)

- **Body Font** — Used for paragraphs and regular text. Options include:
  - Inter, Roboto, Open Sans, Poppins, Lato

### 3.5 Change Theme Colors
Under the **Theme Colors** section, you can fine-tune individual colors. Each field has a color picker — just click on it and pick a color, or type a hex code (like `#4B2E83`).

| Color Field | What It Controls | Example |
|---|---|---|
| Primary Color | Main brand color (buttons, links, accents) | `#4B2E83` (purple) |
| Secondary Color | Secondary brand color (dark backgrounds) | `#1A103D` |
| Accent Color | Highlights, badges, special elements | `#EAB308` (gold) |
| Background Color | Main page background | `#FFFFFF` (white) |
| Surface Color | Card and panel backgrounds | `#FFFFFF` |
| Muted Background | Alternating section backgrounds | `#F8F4FF` (light purple) |
| Text Color | Default body text color | `#1A103D` |

### 3.6 Social Media Links
Scroll down to **Social Media Links**. Here you can add links to your social profiles.

1. Click **Add Social Media Link**
2. Choose the **Platform** (Facebook, Twitter/X, Instagram, YouTube, LinkedIn)
3. Paste the full **URL** (e.g., `https://www.facebook.com/yourpage`)
4. Repeat for each platform
5. Click **Save**

These links will appear in the footer (if enabled) and anywhere else the site displays social icons.

---


## 4. Header & Top Bar

**Who can access:** Super Admin only

The Header is what visitors see at the very top of every page. It includes the top announcement bar, logos, navigation menu, search bar, and the call-to-action button.

### How to get there
Click **Header** in the left sidebar.

### 4.1 Top Bar (The Slim Bar Above the Header)
This is the thin colored strip at the very top of the page — great for announcements or a welcome message.

- **Enabled** — Check this box to show the top bar. Uncheck to hide it.
- **Text** — Type your message (e.g., "Welcome to the Digital University Computing Centre")
- **Background Color** — Click the color picker to choose a background color (default is dark blue `#1E3A5F`)

> **Example:** You might use this for "Admissions Open for 2026-27" or "New Software: MATLAB R2026a Now Available"

### 4.2 Left Logo (Your Organization Logo)
This is the main logo on the left side of the header.

- **Image** — Click **Upload** to add your logo image, or pick one from the Media Library
- **URL** — Where the logo links to when clicked (default: `/` which is the homepage)
- **Height** — Logo height in pixels (default: 50). The width adjusts automatically.
- **Max Width** — Maximum width in pixels (default: 200). Keeps the logo from getting too wide.

> **Recommended:** Use a transparent PNG logo, around 200×60 pixels.

### 4.3 Center Logo (Ministry / Parent Organization Logo)
If your organization has a parent body (like a Ministry or University), you can show their logo in the center.

- **Image** — Upload the parent organization's logo
- **Title** — Text next to the logo (e.g., "Ministry of Education")
- **Subtitle** — Secondary text (e.g., "Government of India")
- **URL** — Link when clicked (e.g., the ministry's website)
- **Height** — Logo height in pixels (default: 60)
- **Max Width** — Maximum width (default: 300)

> **Tip:** If you do not need a center logo, just leave all these fields empty.

### 4.4 Search Bar
- **Enabled** — Check to show the search bar in the header. Uncheck to hide it.
- **Placeholder** — The ghost text inside the search box (default: "Search...")

---

## 5. Navigation Menu

Still inside the **Header** settings, scroll down to the **Navigation Items** section.

### 5.1 How the Navigation Works
The navigation menu is the row of links visitors use to move around your site (Home, About, Services, etc.).

There are **two ways** pages appear in the navigation:

**Automatic:** When you create a new Page and check "Show in Navigation" (in the page sidebar), it automatically appears in the menu.

**Manual:** You can also manually add and arrange items here in the Header settings.

### 5.2 Add a Navigation Item
1. Click **Add Navigation Item**
2. Fill in:
   - **Label** — The text visitors see (e.g., "About Us")
   - **URL** — The link (e.g., `/about`). Leave blank if this item has a dropdown submenu.
3. Click **Save**

### 5.3 Add a Dropdown Submenu
If you want a menu item to have a dropdown (e.g., "Services" with sub-items like "Software", "Training", "Projects"):

1. Add the parent item (e.g., Label: "Services", URL: leave blank)
2. Under that item, find **Submenu Items**
3. Click **Add Submenu Item**
4. Select a **Page** from the dropdown — it will automatically use that page's title and URL
5. Optionally type an **Override Label** if you want different text than the page title
6. Repeat for each sub-item

### 5.4 Reorder Navigation Items
Drag and drop the items to reorder them. The order here is the order they appear on the website.

### 5.5 Navigation Alignment
- **Navigation Alignment** — Choose where the menu sits in the header bar:
  - **Left** — Menu items aligned to the left
  - **Center** — Menu items centered (default)
  - **Right** — Menu items aligned to the right

---

## 6. CTA Button

Still inside the **Header** settings, scroll down to **CTA Button**.

This is the prominent button on the right side of the header (e.g., "Apply Now", "Request Access", "Contact Us").

- **Enabled** — Check to show the button. Uncheck to hide it.
- **Label** — Button text (e.g., "Apply Now")
- **URL** — Where the button links to (e.g., `/apply` or `https://forms.google.com/your-form`)

Click **Save** when done.

---


## 7. Footer

**Who can access:** Super Admin only

The footer appears at the bottom of every page. It contains link columns, logos, contact info, copyright text, and optional visitor count.

### How to get there
Click **Footer** in the left sidebar.

### 7.1 Footer Columns (Link Groups)
You can have up to **4 columns** of links in the footer. Each column has a heading and a list of links.

**To add a column:**
1. Click **Add Footer Column**
2. Type a **Heading** (e.g., "Quick Links", "Resources", "Policies")
3. Under **Links**, click **Add Link**:
   - **Label** — The link text (e.g., "Privacy Policy")
   - **URL** — The link address (e.g., `/privacy` or `https://example.com/policy`)
   - **Open in New Tab** — Check this if the link should open in a new browser tab
4. Add as many links as you need
5. Click **Save**

### 7.2 Footer Logos
- **Left Logo** — Upload a logo for the left side (e.g., Ministry of Education logo)
- **Right Logo** — Upload a logo for the right side (e.g., your organization logo)

### 7.3 Contact Information
- **Address** — Your physical address (e.g., "Block C, Ministry of Education, New Delhi – 110001")
- **Email** — Contact email (e.g., "contact@ducc.edu")
- **Phone** — Phone number (e.g., "+91-11-23381426")

### 7.4 Copyright Text
Type your copyright notice. Example:
> © 2026 Digital University Computing Centre. All rights reserved.

### 7.5 Show Social Links
- **Show Social Links** — Check this to display the social media icons you set up in Site Settings. Uncheck to hide them from the footer.

### 7.6 Last Updated Date
- **Enabled** — Check to show a "Last Updated" date in the footer
- **Label** — The label text (default: "Last Updated")
- **Date** — Pick a date, or leave blank to automatically show today's date

### 7.7 Visitor Count
- **Enabled** — Check to show a visitor counter in the footer
- **Label** — The label text (default: "Total Visitors")
- **Count** — Manually enter the visitor count number

---

## 8. Pages

**Who can access:** Content Editor, School Admin, Super Admin

Pages are the backbone of your website. The Home page, About page, Services page, Contact page — they are all managed here.

### How to get there
Click **Pages** in the left sidebar. You will see a list of all your pages.

### 8.1 Edit an Existing Page
1. Click on the page name in the list (e.g., "Home" or "About Us")
2. You will see the page editor with all its fields and content blocks
3. Make your changes
4. Click **Save** at the top right

### 8.2 Create a New Page
1. Click the **Create New** button at the top right of the Pages list
2. Fill in the fields:

| Field | What It Does | Example |
|---|---|---|
| **Title** | The page name (shown in the banner at the top of the page) | "About Us" |
| **Banner Eyebrow** | Small badge text above the title on the page banner | "ABOUT US" |
| **Banner Description** | Description text below the title on the banner | "Learn about our mission and history" |
| **Slug** | The URL path — auto-generated from the title if you leave it blank | "about-us" → your site will be at `/about-us` |
| **Parent** | If this is a sub-page, select the parent page | Select "Services" if this is a sub-page of Services |

### 8.3 SEO Settings (Search Engine Optimization)
Expand the **SEO** section to help your page appear better in Google search results:

- **Meta Title** — Override the page title for search engines (leave blank to use the page title)
- **Meta Description** — A short summary of the page (shown in Google search results). Keep it under 160 characters.
- **Open Graph Image** — The image that appears when someone shares your page on Facebook, Twitter, etc.

### 8.4 Sidebar Settings (Right Side of the Editor)
On the right side of the page editor, you will find:

- **Status** — Choose **Draft** (not visible to the public) or **Published** (live on the website)
- **Show in Navigation** — Check this to automatically add the page to the header menu
- **Nav Order** — A number that controls the order in the menu (lower numbers appear first, e.g., Home = 0, About = 1, Services = 2)
- **Published Date** — When the page was published

> **Important:** A page set to "Draft" will NOT be visible to website visitors. Only logged-in editors can see draft pages. Always set it to "Published" when you are ready for the public to see it.

### 8.5 Page Layout (Content Blocks)
The main content area of every page is built using **Blocks**. Think of blocks as building bricks — you stack them to build your page.

Scroll down to the **Layout** section. This is where you add, remove, and rearrange content blocks.

See the next section for a full guide on every block type.

---


## 9. Building Pages with Blocks (The Fun Part)

Blocks are the content sections you add to any page. Each block is a different type of section. You mix and match them to build your page exactly how you want.

### How to Add a Block
1. Open any Page (or News article, Software item, etc.)
2. Scroll down to the **Layout** section
3. Click **Add Block**
4. A menu appears with all available block types — pick one
5. Fill in the fields for that block
6. Click **Save**

### How to Reorder Blocks
Drag and drop blocks up or down to change their order on the page.

### How to Delete a Block
Click the **trash icon** on the block you want to remove.

---

### 9.1 Hero Block (The Big Banner at the Top)
This is the large, eye-catching section at the very top of a page — usually with a big image, heading, and buttons.

**Fields you will fill in:**

For each **slide** (yes, you can have multiple slides that rotate):

| Field | What to Enter | Example |
|---|---|---|
| **Media Type** | Choose what kind of media to show | "Image Media" is the most common |
| **Image** | Upload a large, high-quality image | A campus photo, 1920×800px |
| **Eyebrow Badge Text** | Small text above the heading | "ESTABLISHED 1956" |
| **Show Text Overlay** | Check to show text on top of the image | ✓ |
| **Heading** | The big headline | "Welcome to DUCC" |
| **Heading Color** | Color of the heading text | `#FFFFFF` (white) |
| **Description** | Text below the heading | "Empowering digital education across India" |
| **Description Color** | Color of the description text | `#E0E0E0` (light gray) |

**Buttons on the Hero:**
- Click **Add Button**
- **Label** — Button text (e.g., "Explore Services")
- **URL** — Where it links to (e.g., `/services`)
- **Variant** — Primary (filled), Secondary (lighter), or Outline (border only)

**Other Hero Options:**
- **Overlay Color** — A color layer over the image to make text readable (e.g., dark overlay)
- **Overlay Opacity** — How strong the overlay is (0 = invisible, 100 = solid color)
- **Min Height** — How tall the hero section is (e.g., "70vh" means 70% of the screen height)
- **Auto-play** — Check to make slides rotate automatically
- **Auto-play Interval** — Seconds between slides (default: 5)

> **Media Type Options:**
> - **Image Media** — A photo or graphic (most common)
> - **Video Media** — An uploaded video file
> - **YouTube / Vimeo** — Paste a YouTube or Vimeo URL
> - **Animation** — A Lottie animation or GIF
> - **Text Content (No Media)** — Just text, no image
> - **Data Visualization** — An embedded chart or map

---

### 9.2 Marquee / Ticker Block (Scrolling Announcements)
A scrolling horizontal strip — great for announcements, breaking news, or important notices.

| Field | What to Enter | Example |
|---|---|---|
| **Ticker Items** | Add multiple items that scroll across | |
| → Text | The announcement text | "Admissions Open for 2026-27" |
| → URL | Optional link when clicked | "/apply" |
| → Icon | Optional icon next to the text | Pick from icon list |
| → Badge | Optional label like "NEW" or "IMPORTANT" | "NEW" |
| **Background Color** | Strip background color | `#1E3A5F` (dark blue) |
| **Text Color** | Text color | `#FFFFFF` (white) |
| **Speed** | How fast it scrolls | Slow, Normal, or Fast |
| **Pause on Hover** | Stop scrolling when mouse hovers over it | ✓ |
| **Separator** | Character between items | "•" or "|" or "★" |

---

### 9.3 Feature Cards Block (Service Cards, Project Cards, etc.)
A grid of cards — very versatile. Used for services, features, projects, trainings, and more.

**Common fields:**
- **Section Heading** — Title above the cards (e.g., "Our Services")
- **Section Description** — Description below the heading
- **Eyebrow Text** — Small uppercase text above the heading (e.g., "WHAT WE DO")
- **CTA Link Label** — Link text next to the heading (e.g., "Explore all services")
- **CTA Link URL** — Where that link goes

**Card Layout** — Choose how cards look:
| Layout | Best For |
|---|---|
| Classic | General purpose feature cards |
| Minimal | Clean, simple cards |
| Split | Cards with image on one side |
| Accent Top | Cards with a colored top border |
| Service Cards | Service/department cards with icons |
| Service Detail (Alternating) | Detailed service descriptions |
| Project Cards (Progress Bar) | Projects with progress percentage |
| Training Cards | Training programmes |

**For each card:**
- **Title** — Card heading
- **Description** — Card text
- **Icon** — Pick an icon from the icon picker
- **Image** — Upload a card image
- **Link Label** — Button text (e.g., "Learn More")
- **Link URL** — Where the button goes

**Other options:**
- **Columns** — 2, 3, or 4 columns
- **Card Theme** — Dark (dark background) or Light (white cards)
- **Show Card Numbers** — Show 01, 02, 03 on each card

---

### 9.4 Call to Action Block (CTA Banner)
A prominent section that encourages visitors to take action.

| Field | What to Enter | Example |
|---|---|---|
| **Layout** | Default or Full-Width Banner (Gradient Card) | "Full-Width Banner" for a bold look |
| **Heading** | The main CTA text | "Ready to Get Started?" |
| **Description** | Supporting text | "Request access to our software catalog today" |
| **Buttons** | Up to 2 buttons | |
| → Label | Button text | "Request Access" |
| → URL | Button link | "/apply" |
| → Variant | Primary, Secondary, or Outline | "Primary" |
| **Background Type** | Color or Image | "Color" |
| **Background Color** | If color, pick one | `#1E40AF` (blue) |
| **Background Image** | If image, upload one | A relevant photo |

---

### 9.5 Rich Content Block (Text Section)
A simple text section — like a word processor. Use this for paragraphs, lists, headings, and formatted text.

| Field | What to Enter | Example |
|---|---|---|
| **Section Heading** | Optional heading above the text | "Our Mission" |
| **Content** | Rich text editor — type and format your text | Use the toolbar for bold, italic, lists, links, etc. |
| **Max Width** | How wide the text area is | Narrow (640px), Medium (768px), or Full Width |

> **Tip:** The rich text editor supports bold, italic, underline, headings (H1-H6), bullet lists, numbered lists, links, tables, text colors, highlight colors, and text alignment.

---

### 9.6 Content with Media Block (Text + Image Side by Side)
A section with text on one side and an image on the other.

| Field | What to Enter | Example |
|---|---|---|
| **Content** | Rich text for the text side | Your description, bullet points, etc. |
| **Media** | Upload an image | A relevant photo |
| **Media Position** | Image on the left or right | "Media on Right" |

---

### 9.7 Statistics / Impact Block (Numbers That Impress)
Show impressive numbers with animated counters.

**Layout options:**
- **Card Grid** — Colored icon cards in a grid
- **Circular Rings** — Donut/ring progress charts
- **Interlocking Rings** — Ribbon weave style
- **Horizontal Strip** — Dark horizontal bar

**For each stat:**
| Field | What to Enter | Example |
|---|---|---|
| **Label** | What the number represents | "Students Enrolled" |
| **Numeric Value** | The number (animates counting up) | 10000 |
| **Suffix** | Text after the number | "+" |
| **Prefix** | Text before the number | "₹" |
| **Icon** | Pick an icon | graduation cap, users, etc. |
| **Description** | Short text below the stat | "Across 28 states" |

**Other options:**
- **Enable Count Up** — Animate numbers counting up when scrolled into view
- **Enable Hover Zoom** — Zoom effect when hovering over a card
- **Columns** — 2, 3, or 4 columns

---

### 9.8 Image Gallery Block
A grid of images — great for campus photos, event galleries, etc.

| Field | What to Enter | Example |
|---|---|---|
| **Section Heading** | Gallery title | "Campus Gallery" |
| **Columns** | 2, 3, or 4 columns | "3" |
| **Images** | Add multiple images | |
| → Image | Upload each image | Campus photos |
| → Caption | Optional text below each image | "Main Building" |

---

### 9.9 FAQ Block (Frequently Asked Questions)
An accordion-style section where visitors click to expand answers.

**Layout options:**
- **Default** — Standard accordion
- **Styled Accordion (Purple Theme)** — Themed accordion with colors

**For each FAQ item:**
| Field | What to Enter | Example |
|---|---|---|
| **Question** | The question | "How do I request software access?" |
| **Answer** | The answer (rich text) | "Visit the Software page and click Request Access..." |

---

### 9.10 Testimonials Block (Quotes from People)
Show quotes from students, faculty, or stakeholders.

**Layout options:**
- **Default Carousel** — Rotating cards
- **Large Quote (Dark Full-Width)** — Big, bold quote on dark background

**For each testimonial:**
| Field | What to Enter | Example |
|---|---|---|
| **Quote** | The testimonial text | "DUCC transformed our digital infrastructure..." |
| **Name** | Person's name | "Dr. Sharma" |
| **Role** | Their title/position | "Professor, Computer Science" |
| **Avatar** | Their photo | Upload a headshot |
| **Initials** | Fallback if no photo | "DS" |

---

### 9.11 Team / Faculty Grid Block
A grid of team member cards with photos, names, roles, and social links. This is the main block for showing your people.

| Field | What to Enter | Example |
|---|---|---|
| **Section Heading** | Title above the grid | "Our Team" |
| **Columns** | 2, 3, 4, 5, or 6 columns | "4" |
| **Show Stats** | Show rating and student count | ✓ or leave unchecked |
| **Show Social Links** | Show social media icons on cards | ✓ |

**For each team member:**
| Field | What to Enter | Example |
|---|---|---|
| **Photo** | Upload their profile photo | Headshot image |
| **Name** | Full name | "Dr. Ankit Sharma" |
| **Specialty / Designation** | Their role | "Professor & HOD" |
| **Short Description** | Brief bio | "Expert in machine learning and AI" |
| **Profile Link** | External URL (leave empty for auto-link) | Leave empty |

**Social Links for each member:**
- Click **Add Social Link**
- Choose platform (LinkedIn, Twitter/X, GitHub, Google Scholar, etc.)
- Paste the URL

> **Profile Pages:** Each team member automatically gets their own profile page. See Section 15 for how to fill in detailed profile information.

---

### 9.12 Tabs Block
Organize content into clickable tabs — visitors click a tab to see different content.

**For each tab:**
| Field | What to Enter | Example |
|---|---|---|
| **Label** | Tab name | "Undergraduate", "Postgraduate", "PhD" |
| **Content** | Rich text content for that tab | Course details, requirements, etc. |

---

### 9.13 Banner / Alert Block
A colored alert bar — use for important notices, warnings, or success messages.

| Field | What to Enter | Example |
|---|---|---|
| **Type** | Info (blue), Success (green), Warning (yellow), Error (red) | "Warning" |
| **Message** | The alert text | "Campus will be closed on May 1st for maintenance" |
| **Dismissible** | Can visitors close it? | ✓ |
| **Link Label** | Optional link text | "View Schedule" |
| **Link URL** | Optional link | "/schedule" |

---

### 9.14 Embed Block (YouTube, Maps, Custom Code)
Embed external content like YouTube videos, Google Maps, or any iframe.

| Field | What to Enter | Example |
|---|---|---|
| **Embed Type** | HTML Code or iFrame URL | "iFrame URL" for YouTube/Maps |
| **iFrame URL** | The URL to embed | `https://www.youtube.com/embed/VIDEO_ID` |
| **HTML** | Custom HTML code (if HTML type) | Paste embed code |
| **Height** | Height in pixels | 400 |

---

### 9.15 Flexible Row Block (Advanced Layout)
A powerful block that lets you place multiple content pieces side by side in columns. Each column can contain different types of content.

**Column types you can add:**
- **Rich Text** — Formatted text with font and color options
- **Image** — An image with caption and styling options
- **Button** — A clickable button with customizable colors
- **Spacer** — Empty space for layout purposes
- **Icon Box** — An icon with text
- **Video** — An embedded video

**Row options:**
- **Columns** — How many columns (1 to 6)
- **Gap** — Space between columns
- **Background Color** — Row background color
- **Vertical Alignment** — Top, center, or bottom alignment
- **Padding** — Space around the row

> **Tip:** This is the most flexible block. Use it when none of the other blocks fit your needs.

---

### 9.16 Other Available Blocks

| Block | What It Does |
|---|---|
| **Marquee / Ticker** | Scrolling announcement strip |
| **Showcase Cards** | Highlighted showcase items |
| **News Updates** | Auto-pulls latest news articles |
| **Interactive Map** | Embedded interactive map |
| **Screenshot Gallery** | Gallery optimized for screenshots |
| **Help & Support** | Help/support section with contact options |
| **Career Posting** | Job/career listings |
| **States Onboarded** | Map/list of states/regions |
| **Form Layout** | Embedded form |
| **Goa School Snapshot** | Specialized school data visualization |

---

### Every Block Has These Common Fields
No matter which block you add, most blocks share these fields at the top:

| Field | What It Does |
|---|---|
| **Section Heading** | A title displayed above the block |
| **Section Description** | A description below the heading |
| **Heading Alignment** | Left, Center, or Right alignment for the heading |

---


## 10. News Articles

**Who can access:** Content Editor, School Admin, Super Admin

### How to get there
Click **News** in the left sidebar.

### 10.1 Create a News Article
1. Click **Create New**
2. Fill in the fields:

| Field | What to Enter | Example |
|---|---|---|
| **Title** | Article headline | "New Computer Lab Inaugurated" |
| **Slug** | URL path (auto-generated from title) | "new-computer-lab-inaugurated" |
| **Excerpt** | Short summary shown on the news listing page | "The new state-of-the-art lab was inaugurated by..." |
| **Featured Image** | Main image for the article | Upload a photo |
| **Category** | Category label | "Update", "Press Release", "Event" |
| **Content** | The full article text (rich text editor) | Write your article here |
| **Published Date** | When the article was published | Pick a date |
| **Tags** | Keywords for the article | Add tags like "infrastructure", "campus" |
| **Is Featured** | Mark as featured (shown prominently) | ✓ for important news |

### 10.2 Sidebar Settings
- **Status** — Set to **Draft** while writing, change to **Published** when ready to go live

### 10.3 Adding Extra Content Blocks
Below the main content field, there is a **Page Layout** section where you can add blocks (Hero, Gallery, FAQ, etc.) for richer article pages. This is optional — the main content field is usually enough.

> **Tip:** Always upload a Featured Image — articles without images look incomplete on the listing page.

---

## 11. Software Catalog

**Who can access:** Content Editor, School Admin, Super Admin

This section manages the university's licensed software catalog.

### How to get there
Click **Software** in the left sidebar.

### 11.1 Add a New Software Entry
1. Click **Create New**
2. Fill in the fields:

| Field | What to Enter | Example |
|---|---|---|
| **Name** | Software name | "MATLAB" |
| **Category** | Choose from the dropdown | "Research Software" |
| **Description** | Short description | "Numerical computing environment for engineering and science" |
| **Icon** | Pick an icon from the icon picker | Choose a relevant icon |
| **Users** | Number of users | "1,309" or "Site Licence" |
| **Submissions** | Number of submissions (if applicable) | "33,750" |
| **Licenses** | Number of licenses | "100" or "Campus Agreement" |
| **Validity Start Date** | When the license started | Pick a date |
| **Validity (Years)** | How long the license lasts | "3" or "Perpetual" |
| **Issued To** | Who has access | "All Engineering Departments" |
| **Remaining Licenses** | How many are left | "45" |
| **License Type** | Type of license | "Network License", "Campus Agreement", etc. |
| **Website URL** | Official software website | "https://www.mathworks.com" |
| **Request Access URL** | Link for requesting access | "/apply" |

### 11.2 Sidebar Settings
- **Status** — Active, Expired, or Coming Soon
- **Featured** — Check to show this software prominently
- **Sort Order** — Lower numbers appear first in the list

### 11.3 Available Categories
- Plagiarism Detection
- Research Software
- Productivity
- Statistical Software
- e-Governance
- Designing Tools
- Scientific Software
- Simulation
- Other

---

## 12. Projects

**Who can access:** Content Editor, School Admin, Super Admin

Manage IT projects and initiatives with progress tracking.

### How to get there
Click **Projects** in the left sidebar.

### 12.1 Add a New Project
1. Click **Create New**
2. Fill in:

| Field | What to Enter | Example |
|---|---|---|
| **Title** | Project name | "Campus Wi-Fi Upgrade" |
| **Description** | What the project is about | "Upgrading wireless infrastructure across all buildings" |
| **Modules** | Add project components/modules | "Phase 1 - Academic Block", "Phase 2 - Hostels" |
| **Link** | Optional link for "View details" | "/projects/wifi-upgrade" |

### 12.2 Sidebar Settings
- **Status** — Ongoing, Active, Live, Completed, or Planned
- **Progress** — A number from 0 to 100 (shown as a progress bar on the website)
- **Sort Order** — Lower numbers appear first

> **Example:** Set Progress to 75 for a project that is 75% complete. The website will show a progress bar filled to 75%.

---

## 13. Trainings

**Who can access:** Content Editor, School Admin, Super Admin

Manage training programmes and workshops.

### How to get there
Click **Trainings** in the left sidebar.

### 13.1 Add a New Training
1. Click **Create New**
2. Fill in:

| Field | What to Enter | Example |
|---|---|---|
| **Title** | Training name | "Python for Data Science" |
| **Image** | Card image | Upload a relevant image |
| **Category** | Category for filtering | "Programming" |
| **Duration** | How long it lasts | "5 Days" |
| **Mode** | In-person, Online, or Hybrid | "Hybrid" |
| **Audience** | Who it is for | "Faculty & Research Scholars" |
| **Level** | Beginner, Intermediate, or Advanced | "Intermediate" |
| **Next Batch Date** | When the next batch starts | Pick a date |
| **Topics Covered** | Add topics one by one | "NumPy", "Pandas", "Matplotlib", "Scikit-learn" |
| **Registration URL** | Link for the Register button | "https://forms.google.com/your-form" |

### 13.2 Sidebar Settings
- **Status** — Active, Upcoming, or Completed
- **Sort Order** — Lower numbers appear first

---


## 14. Team / People Pages

**Who can access:** Content Editor, School Admin, Super Admin

Team Pages are special pages designed to showcase your team, faculty, or staff.

### How to get there
Click **Team Pages** in the left sidebar.

### 14.1 Create a Team Page
1. Click **Create New**
2. Fill in:

| Field | What to Enter | Example |
|---|---|---|
| **Page Name** | Internal name (for your reference) | "Main Team Page" |
| **Page Title → Title** | The heading visitors see | "Our Team" |
| **Page Title → Eyebrow** | Small badge text above the title | "MEET THE TEAM" |
| **Page Title → Description** | Text below the title | "The people behind our digital transformation" |
| **Slug** | URL path | "team" → page will be at `/team` |

### 14.2 Adding Team Members
In the **Layout** section, add a **Team / Faculty Grid** block. Then add members to it (see Section 9.11 above for all the fields).

### 14.3 Sidebar Settings
- **Status** — Active or Inactive

---

## 15. Individual People Profiles

Every team member added in a Team Grid block automatically gets their own profile page (e.g., `/instructors/dr-ankit-sharma`).

To fill in the detailed profile, go to the Team Grid block where the member was added, find their entry, and expand the **Profile Page Details** section.

### Profile Page Fields

| Field | What to Enter | Example |
|---|---|---|
| **Full Biography** | Detailed bio | "Dr. Sharma has 15 years of experience in..." |
| **Email** | Contact email | "ankit.sharma@ducc.edu" |
| **Phone** | Phone number | "+91-11-12345678" |
| **Office Location** | Where they sit | "Room 204, Block C" |

### Research Interests
Click **Add Research Interest** and type each one:
- "Machine Learning"
- "Natural Language Processing"
- "Computer Vision"

### Education
Click **Add Education** for each degree:
| Field | Example |
|---|---|
| **Degree** | "Ph.D. in Computer Science" |
| **Institution** | "IIT Delhi" |
| **Year** | "2015" |

### Experience
Click **Add Experience** for each position:
| Field | Example |
|---|---|
| **Position** | "Associate Professor" |
| **Organization** | "Delhi University" |
| **Duration** | "2015 - Present" |
| **Description** | "Teaching and research in AI/ML" |

### Awards & Honors
Click **Add Award** for each:
| Field | Example |
|---|---|
| **Title** | "Best Paper Award" |
| **Year** | "2023" |
| **Organization** | "IEEE" |

### Courses
Click **Add Course** for each course they teach:
| Field | Example |
|---|---|
| **Course Name** | "Introduction to Machine Learning" |
| **Course Code** | "CS601" |
| **Semester** | "Fall 2025" |
| **Description** | "Fundamentals of supervised and unsupervised learning" |

### Publications
Click **Add Publication** for each:
| Field | Example |
|---|---|
| **Title** | "Deep Learning for Medical Image Analysis" |
| **Journal** | "IEEE Transactions on Medical Imaging" |
| **Year** | "2024" |
| **Link** | "https://doi.org/10.1109/..." |

### Academic Links
Click **Add Academic Link** for each:
- Choose platform: Google Scholar, ResearchGate, ORCID, Academia.edu, Scopus, Web of Science
- Paste the URL

---

## 16. Software Requests

**Who can access:** Super Admin only

When visitors submit a software access request through the website, it appears here.

### How to get there
This section may be hidden in the sidebar. Look for **Software Requests** or navigate to `/admin/collections/job-applications`.

### 16.1 Viewing Requests
Each request shows:
- **Full Name** — Who submitted it
- **Email** — Their email
- **Software / Service Requested** — What they want access to
- **Request Type** — Software Access or IT Service
- **Department / College** — Where they are from
- **Designation** — Their role (Professor, Student, etc.)
- **Purpose** — Why they need it
- **I am** — Student, PhD Scholar, Faculty, Non-Teaching Staff, or Other
- **Additional Notes** — Any extra information
- **Submitted At** — When they submitted

### 16.2 Managing Requests
In the sidebar, change the **Request Status**:
- **New** — Just submitted, not yet reviewed
- **Reviewed** — You have looked at it
- **Approved** — Access granted
- **Rejected** — Access denied
- **Delete** — Permanently removes the request (and any attached files)

> **Warning:** Setting status to "Delete" will permanently remove the request. This cannot be undone.

---


## 17. Media Library

**Who can access:** Everyone who can log in

The Media Library is where all your images and files are stored. Every time you upload an image anywhere in the admin panel, it goes into the Media Library.

### How to get there
Click **Media** in the left sidebar.

### 17.1 Upload a New Image/File
1. Click **Create New**
2. Click **Upload** or drag and drop your file
3. Fill in the **Alt Text** field — this is a short description of the image (important for accessibility and SEO)
   - Example: "Campus main building exterior view"
4. Click **Save**

### 17.2 Image Tips
- **Supported formats:** JPG, PNG, WebP, SVG, GIF
- **Auto-optimization:** Images are automatically converted to WebP format and optimized for fast loading
- **Recommended sizes:**
  - Hero images: 1920×800px or larger
  - Card images: 600×400px
  - Profile photos: 400×400px (square)
  - Logos: 200×60px (transparent PNG)
- **Always fill in Alt Text** — It helps visually impaired visitors and improves Google search ranking

### 17.3 Using Existing Images
When uploading an image in any field (like a page hero or news featured image), you can either:
- **Upload a new file** — Click Upload
- **Choose existing** — Browse the Media Library and select an image you already uploaded

---

## 18. Forms

The website has a built-in form builder (powered by the Form Builder plugin). Forms can be embedded on any page using the **Form Layout** block.

### 18.1 Where to Find Forms
Forms may be listed under a separate section in the sidebar, or they may be managed through the Form Layout block on individual pages.

### 18.2 Embedding a Form on a Page
1. Edit the page where you want the form
2. Add a **Form Layout** block in the Layout section
3. Select the form you want to embed
4. Click **Save**

### 18.3 Form Submissions
When visitors fill out a form, their submissions are stored in the admin panel. Look for **Form Submissions** in the sidebar.

---

## 19. User Management

**Who can access:** Super Admin only

### How to get there
Click **Users** in the left sidebar.

### 19.1 View All Users
You will see a list of all admin users with their email addresses and roles.

### 19.2 Create a New User
1. Click **Create New**
2. Fill in:
   - **Email** — Their login email
   - **Password** — Set a temporary password (they can change it later)
   - **First Name** — Their first name
   - **Last Name** — Their last name
   - **Roles** — Select one or more roles (see Section 20 below)
3. Click **Save**

### 19.3 Edit a User
Click on a user's email in the list to edit their details or change their role.

### 19.4 Delete a User
Open the user and click **Delete** at the bottom. This removes their access to the admin panel.

> **Important:** Only Super Admins can create, edit roles, or delete users. Regular editors can only update their own profile.

---

## 20. Roles & Permissions Explained

There are four roles in the system. Each role has different levels of access:

### Super Admin
- **Full access to everything**
- Can change Site Settings, Header, Footer
- Can create, edit, and delete all content
- Can manage users (create, edit roles, delete)
- Can delete pages and content permanently

### School Admin
- Can create and edit all content (Pages, News, Software, Projects, Trainings, Team Pages)
- Can **delete** content items
- Cannot change Site Settings, Header, or Footer
- Cannot manage other users

### Content Editor
- Can **create and edit** content (Pages, News, Software, Projects, Trainings, Team Pages)
- **Cannot delete** content items
- Cannot change Site Settings, Header, or Footer
- Cannot manage other users

### Viewer
- Can **view** content in the admin panel
- Cannot create, edit, or delete anything
- Useful for stakeholders who need to review content

### Quick Reference Table

| Action | Super Admin | School Admin | Content Editor | Viewer |
|---|:---:|:---:|:---:|:---:|
| Edit Site Settings | ✓ | ✗ | ✗ | ✗ |
| Edit Header / Footer | ✓ | ✗ | ✗ | ✗ |
| Create Pages / News | ✓ | ✓ | ✓ | ✗ |
| Edit Pages / News | ✓ | ✓ | ✓ | ✗ |
| Delete Pages / News | ✓ | ✓ | ✗ | ✗ |
| Manage Users | ✓ | ✗ | ✗ | ✗ |
| View Admin Panel | ✓ | ✓ | ✓ | ✓ |
| Manage Software Requests | ✓ | ✗ | ✗ | ✗ |

---

## 21. Tips & Common Questions

### How do I change the home page?
Go to **Site Settings** → Find the **Home Page** dropdown → Select the page you want as your home page → Click **Save**. The selected page will now be displayed when visitors go to your main website URL.

### How do I make a page live?
Edit the page → In the sidebar, change **Status** from "Draft" to "Published" → Click **Save**.

### How do I take a page offline temporarily?
Edit the page → Change **Status** to "Draft" → Click **Save**. The page will no longer be visible to the public.

### How do I change the order of pages in the navigation?
Edit each page → In the sidebar, change the **Nav Order** number. Lower numbers appear first (e.g., Home = 0, About = 1, Services = 2).

### How do I add a new page to the navigation menu?
When creating or editing a page, check **Show in Navigation** in the sidebar. It will automatically appear in the header menu.

### How do I remove a page from the navigation without deleting it?
Edit the page → Uncheck **Show in Navigation** in the sidebar → Click **Save**.

### How do I change the Home page content?
Go to **Pages** → Click on the page with slug "home" (or whatever your home page is called) → Edit the blocks in the Layout section.

### How do I add a YouTube video to a page?
Add an **Embed** block → Set Embed Type to "iFrame URL" → Paste the YouTube embed URL (e.g., `https://www.youtube.com/embed/VIDEO_ID`).

### How do I change the site colors without changing the theme?
Go to **Site Settings** → Scroll to **Theme Colors** → Use the color pickers to change individual colors → Click **Save**.

### What is a "slug"?
A slug is the URL-friendly version of a title. For example, a page titled "About Us" gets the slug "about-us", making the URL `yoursite.com/about-us`. Slugs are auto-generated from titles, but you can edit them manually.

### What happens if I delete something?
- **Pages and News:** Deleted permanently. Cannot be undone.
- **Media:** The file is removed from the server. Cannot be undone.
- **Users:** Their access is removed. You can re-create them.

> **Best practice:** Instead of deleting a page, set its status to "Draft" first. This hides it from the public but keeps it in the system in case you need it later.

### How do I change the theme of the entire site?
Go to **Site Settings** → Change the **Theme Preset** dropdown → Click **Save**. The entire site's colors, fonts, and block styles will update automatically.

### How do I upload a large image?
Images are automatically optimized when uploaded. You can upload images up to the server's file size limit (usually 5-10 MB). The system will automatically:
- Convert to WebP format for faster loading
- Resize if larger than 2560×2560px
- Strip unnecessary metadata
- Generate blur placeholders for smooth loading

### I made a change but it is not showing on the website?
1. Make sure you clicked **Save** after making changes
2. Check that the page/article status is set to **Published** (not Draft)
3. Try refreshing the website page (Ctrl+F5 for a hard refresh)
4. If using a CDN or cache, it may take a few minutes to update

---

## Quick Start Checklist

If you are setting up the site for the first time, here is the order to do things:

1. ☐ **Login** to `/admin`
2. ☐ **Site Settings** — Set your site name, choose a theme, add social links
3. ☐ **Header** — Upload your logos, set up the top bar text, configure the CTA button
4. ☐ **Footer** — Add footer columns with links, contact info, copyright text
5. ☐ **Media** — Upload your logo images, hero images, and team photos
6. ☐ **Pages** — Create your main pages (Home, About, Services, Contact)
7. ☐ **News** — Add your first few news articles
8. ☐ **Software** — Add your software catalog entries
9. ☐ **Team Pages** — Create a team page and add members
10. ☐ **Review** — Visit the website to check everything looks good

---

*Last updated: April 2026*
*For technical support, contact your system administrator.*