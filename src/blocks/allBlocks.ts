/**
 * Shared block imports for use in any collection's layout field.
 */
import { Hero } from './Hero'
import { RichContent } from './RichContent'
import { FeatureCards } from './FeatureCards'
import { CallToAction } from './CallToAction'
import { ImageGallery } from './ImageGallery'
import { FAQ } from './FAQ'
import { Statistics } from './Statistics'
import { Testimonials } from './Testimonials'
import { BannerAlert } from './BannerAlert'
import { Embed } from './Embed'
import { TeamGrid } from './TeamGrid'
import { Tabs } from './Tabs'
import { ContentWithMedia } from './ContentWithMedia'
import { Marquee } from './Marquee'
import { ShowcaseCards } from './ShowcaseCards'
import { NewsUpdates } from './NewsUpdates'
import { InteractiveMap } from './InteractiveMap'
import { ScreenshotGallery } from './ScreenshotGallery'
import { HelpSupport } from './HelpSupport'
import { FlexibleRow } from './FlexibleRow'
import { CareerPosting } from './CareerPosting'
import { StatesOnboarded } from './StatesOnboarded'
import { FormLayout } from './FormLayout'
import { GoaSchoolSnapshotBlock } from './GoaSchoolSnapshotBlock'
import { StoryTimeline } from './StoryTimeline'
import { SocialFeeds } from './SocialFeeds'
import { DocumentDownloads } from './DocumentDownloads'
import { ContactSection } from './ContactSection'
import { ProjectShowcase } from './ProjectShowcase'
import { AccessibilityStatement } from './AccessibilityStatement'
import { BlogFeed } from './BlogFeed'

export const allBlocks = [
  Hero,
  StoryTimeline,
  ContactSection,
  ProjectShowcase,
  AccessibilityStatement,
  BlogFeed,
  Marquee,
  DocumentDownloads,
  StatesOnboarded,
  ShowcaseCards,
  Statistics,
  NewsUpdates,
  SocialFeeds,
  InteractiveMap,
  ScreenshotGallery,
  HelpSupport,
  GoaSchoolSnapshotBlock,
  FormLayout,
  RichContent,
  FeatureCards,
  CallToAction,
  ImageGallery,
  FAQ,
  Testimonials,
  BannerAlert,
  Embed,
  TeamGrid,
  Tabs,
  ContentWithMedia,
  FlexibleRow,
  CareerPosting,
]

/** Blocks safe for non-Pages collections (excludes blocks with deeply nested names) */
export const collectionBlocks = [
  Hero,
  Marquee,
  DocumentDownloads,
  StatesOnboarded,
  ShowcaseCards,
  Statistics,
  NewsUpdates,
  SocialFeeds,
  InteractiveMap,
  ScreenshotGallery,
  HelpSupport,
  FormLayout,
  RichContent,
  FeatureCards,
  CallToAction,
  ImageGallery,
  FAQ,
  Testimonials,
  BannerAlert,
  Embed,
  TeamGrid,
  Tabs,
  ContentWithMedia,
  FlexibleRow,
  CareerPosting,
]
