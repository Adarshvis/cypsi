import React from 'react'
import HeroBlock from './blocks/HeroBlock'
import StoryTimelineBlock from './blocks/StoryTimelineBlock'
import RichContentBlock from './blocks/RichContentBlock'
import FeatureCardsBlock from './blocks/FeatureCardsBlock'
import CallToActionBlock from './blocks/CallToActionBlock'
import ImageGalleryBlock from './blocks/ImageGalleryBlock'
import FAQBlock from './blocks/FAQBlock'
import StatisticsBlock from './blocks/StatisticsBlock'
import TestimonialsBlock from './blocks/TestimonialsBlock'
import BannerAlertBlock from './blocks/BannerAlertBlock'
import EmbedBlock from './blocks/EmbedBlock'
import TeamGridBlock from './blocks/TeamGridBlock'
import TabsBlock from './blocks/TabsBlock'
import ContentWithMediaBlock from './blocks/ContentWithMediaBlock'
import MarqueeBlock from './blocks/MarqueeBlock'
import ShowcaseCardsBlock from './blocks/ShowcaseCardsBlock'
import NewsUpdatesBlock from './blocks/NewsUpdatesBlock'
import InteractiveMapBlock from './blocks/InteractiveMapBlock'
import ScreenshotGalleryBlock from './blocks/ScreenshotGalleryBlock'
import HelpSupportBlock from './blocks/HelpSupportBlock'
import FlexibleRowBlock from './blocks/FlexibleRowBlock'
import CareerPostingBlock from './blocks/CareerPostingBlock'
import StatesOnboardedBlock from './blocks/StatesOnboardedBlock'
import FormLayoutBlock from './blocks/FormLayoutBlock'
import GoaSchoolSnapshotBlock from './blocks/GoaSchoolSnapshotBlock'
import SocialFeedsBlock from './blocks/SocialFeedsBlock'

const blockComponents: Record<string, React.ComponentType<any>> = {
  hero: HeroBlock,
  storyTimeline: StoryTimelineBlock,
  marquee: MarqueeBlock,
  showcaseCards: ShowcaseCardsBlock,
  statistics: StatisticsBlock,
  newsUpdates: NewsUpdatesBlock,
  socialFeeds: SocialFeedsBlock,
  interactiveMap: InteractiveMapBlock,
  screenshotGallery: ScreenshotGalleryBlock,
  helpSupport: HelpSupportBlock,
  formLayout: FormLayoutBlock,
  richContent: RichContentBlock,
  featureCards: FeatureCardsBlock,
  callToAction: CallToActionBlock,
  imageGallery: ImageGalleryBlock,
  faq: FAQBlock,
  testimonials: TestimonialsBlock,
  bannerAlert: BannerAlertBlock,
  embed: EmbedBlock,
  teamGrid: TeamGridBlock,
  tabs: TabsBlock,
  contentWithMedia: ContentWithMediaBlock,
  flexibleRow: FlexibleRowBlock,
  careerPosting: CareerPostingBlock,
  statesOnboarded: StatesOnboardedBlock,
  goaSnapshot: GoaSchoolSnapshotBlock,
}

interface BlockRendererProps {
  blocks: { blockType: string; [key: string]: any }[]
}

export default function BlockRenderer({ blocks }: BlockRendererProps) {
  if (!blocks || blocks.length === 0) return null

  return (
    <>
      {blocks.map((block, index) => {
        const Component = blockComponents[block.blockType]
        if (!Component) return null

        const { blockType: _type, blockName: _name, ...rest } = block
        return <Component key={block.id || index} {...rest} />
      })}
    </>
  )
}
