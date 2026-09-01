import type { Block } from 'payload'
import { sectionHeadingFields, colorField } from './shared'

/**
 * A row of social channel cards, each showing recent posts from one account.
 *
 * How each platform is read differs, because their access rules differ:
 *
 *   YouTube, RSS   public feed, fetched on the server and rendered as a list.
 *                  No API key, no app review.
 *   Facebook       the Page Plugin iframe. Shows the page timeline.
 *   X (Twitter)    the official embedded timeline widget.
 *   Instagram      a single post embed. Instagram has no key-free feed for a
 *                  whole profile, so pick the post you want to feature.
 *   LinkedIn       an embedded post, copied from the post's own share menu.
 *
 * That means the YouTube and RSS cards render server-side and are cached,
 * while the rest load in the visitor's browser from the platform.
 */
export const SocialFeeds: Block = {
  slug: 'socialFeeds',
  labels: { singular: 'Social Media Feeds', plural: 'Social Media Feeds' },
  fields: [
    ...sectionHeadingFields,
    colorField('backgroundColor', 'Section Background Color', '#F6F7FB'),
    {
      type: 'row',
      fields: [
        {
          name: 'columns',
          type: 'select',
          defaultValue: '4',
          admin: { width: '50%' },
          options: [
            { label: '2 Columns', value: '2' },
            { label: '3 Columns', value: '3' },
            { label: '4 Columns', value: '4' },
          ],
        },
        {
          name: 'cardHeight',
          type: 'number',
          defaultValue: 340,
          min: 200,
          max: 900,
          admin: {
            width: '50%',
            description: 'Height in pixels of each card body. Longer feeds scroll inside the card.',
          },
        },
      ],
    },
    {
      name: 'refreshMinutes',
      type: 'number',
      defaultValue: 15,
      min: 1,
      max: 1440,
      admin: {
        description:
          'How long fetched YouTube / RSS posts are cached before being refetched. Does not affect Facebook, X, Instagram or LinkedIn cards, which always load live.',
      },
    },
    {
      name: 'feeds',
      type: 'array',
      required: true,
      minRows: 1,
      labels: { singular: 'Channel', plural: 'Channels' },
      admin: { initCollapsed: false },
      fields: [
        {
          name: 'platform',
          type: 'select',
          required: true,
          defaultValue: 'x',
          options: [
            { label: 'X (Twitter) — timeline', value: 'x' },
            { label: 'Facebook — page timeline', value: 'facebook' },
            { label: 'YouTube — latest videos', value: 'youtube' },
            { label: 'Instagram — single post', value: 'instagram' },
            { label: 'LinkedIn — single post', value: 'linkedin' },
            { label: 'RSS / Atom feed', value: 'rss' },
          ],
        },
        {
          name: 'label',
          type: 'text',
          admin: {
            description:
              'Card header text. Leave blank to use the platform name, e.g. "Facebook" or "Posts from @handle".',
          },
        },

        /* ── X ── */
        {
          name: 'handle',
          type: 'text',
          label: 'X Handle or Profile URL',
          admin: {
            description:
              'The account whose posts to show, e.g. CyberDost, @CyberDost or https://x.com/CyberDost',
            condition: (_, s) => s?.platform === 'x',
          },
        },
        {
          name: 'xMode',
          type: 'select',
          label: 'Show',
          defaultValue: 'timeline',
          options: [
            { label: 'Account feed, falling back to the posts below', value: 'timeline' },
            { label: 'Only the posts below', value: 'post' },
          ],
          admin: {
            description:
              'X serves an account feed only to visitors signed in to x.com, unlike Facebook whose page feed is public. Account feed tries the live feed first and shows the posts below to anyone it fails for, so the card is never empty.',
            condition: (_, s) => s?.platform === 'x',
          },
        },
        {
          name: 'xPosts',
          type: 'array',
          label: 'Posts',
          labels: { singular: 'Post', plural: 'Posts' },
          admin: {
            description:
              'Shown in this order, scrolling inside the card. Copy a post URL from X via Share → Copy link. On "Account feed" these act as the fallback: if X will not serve the feed to a visitor, these posts are shown instead.',
            condition: (_, s) => s?.platform === 'x',
            initCollapsed: false,
          },
          fields: [
            {
              name: 'url',
              type: 'text',
              required: true,
              label: 'Post URL',
              admin: {
                placeholder: 'https://x.com/CyberDost/status/1234567890123456789',
              },
            },
          ],
        },
        {
          name: 'xPostUrl',
          type: 'text',
          label: 'X Post URL (legacy)',
          admin: {
            description:
              'Superseded by the Posts list above, which it is appended to. Kept so existing content keeps working.',
            condition: (_, s) =>
              s?.platform === 'x' && s?.xMode === 'post' && Boolean(s?.xPostUrl),
          },
        },
        {
          name: 'xTheme',
          type: 'select',
          label: 'Timeline Theme',
          defaultValue: 'light',
          options: [
            { label: 'Light', value: 'light' },
            { label: 'Dark', value: 'dark' },
          ],
          admin: { condition: (_, s) => s?.platform === 'x' },
        },

        /* ── Facebook ── */
        {
          name: 'facebookPageUrl',
          type: 'text',
          label: 'Facebook Page URL',
          admin: {
            description: 'Full page URL, e.g. https://www.facebook.com/YourPage',
            condition: (_, s) => s?.platform === 'facebook',
          },
        },
        {
          name: 'facebookTab',
          type: 'select',
          label: 'Show',
          defaultValue: 'timeline',
          options: [
            { label: 'Timeline', value: 'timeline' },
            { label: 'Events', value: 'events' },
            { label: 'Messages', value: 'messages' },
          ],
          admin: { condition: (_, s) => s?.platform === 'facebook' },
        },

        /* ── YouTube ── */
        {
          name: 'youtubeId',
          type: 'text',
          label: 'YouTube Channel or Playlist ID',
          admin: {
            description:
              'Channel ID starting "UC…", a playlist ID starting "PL…", or a /channel/ or ?list= URL. Handle URLs (youtube.com/@name) have no public feed and will not work.',
            condition: (_, s) => s?.platform === 'youtube',
          },
        },

        /* ── Instagram ── */
        {
          name: 'instagramPostUrl',
          type: 'text',
          label: 'Instagram Post URL',
          admin: {
            description:
              'A single post or reel URL, e.g. https://www.instagram.com/p/ABC123/. Whole-profile feeds need a reviewed Meta app, so a featured post is used instead.',
            condition: (_, s) => s?.platform === 'instagram',
          },
        },

        /* ── LinkedIn ── */
        {
          name: 'linkedinEmbedUrl',
          type: 'text',
          label: 'LinkedIn Post URL',
          admin: {
            placeholder: 'https://www.linkedin.com/posts/name_slug-activity-7123456789012345678-AbCd',
            description:
              'Paste the post link straight from the address bar or Share → Copy link. An embed URL from the post\'s "…" → Embed this post menu also works. Note that LinkedIn only allows public posts to be embedded.',
            condition: (_, s) => s?.platform === 'linkedin',
          },
        },

        /* ── RSS ── */
        {
          name: 'feedUrl',
          type: 'text',
          label: 'Feed URL',
          admin: {
            description: 'An https RSS 2.0 or Atom feed URL',
            condition: (_, s) => s?.platform === 'rss',
          },
        },

        /* ── List options, shared by the fetched types ── */
        {
          name: 'maxItems',
          type: 'number',
          label: 'Number of Posts',
          defaultValue: 4,
          min: 1,
          max: 20,
          admin: {
            condition: (_, s) => s?.platform === 'youtube' || s?.platform === 'rss',
          },
        },
        {
          name: 'showDates',
          type: 'checkbox',
          defaultValue: true,
          label: 'Show Post Dates',
          admin: {
            condition: (_, s) => s?.platform === 'youtube' || s?.platform === 'rss',
          },
        },
        {
          name: 'showThumbnails',
          type: 'checkbox',
          defaultValue: false,
          label: 'Show Thumbnails',
          admin: {
            description: 'Show the video or article image beside each entry, when the feed provides one',
            condition: (_, s) => s?.platform === 'youtube' || s?.platform === 'rss',
          },
        },

        /* ── Footer link, all platforms ── */
        {
          name: 'profileUrl',
          type: 'text',
          label: 'Profile / Channel Link',
          admin: {
            description: 'Optional "View all" link shown at the bottom of the card',
          },
        },
      ],
    },
  ],
}
