import { blogs } from "@/.velite/generated";
import HomeCoverSection from "../components/Home/HomeCoverSection";
import AboutBand from "../components/Home/AboutBand";
import FeaturedPosts from "../components/Home/FeaturedPosts";
import RecentPosts from "../components/Home/RecentPosts";
import EventsPreview from "../components/Home/EventsPreview";

export default function Home() {
  const published = blogs.filter((blog) => blog.isPublished);

  return (
    <main className="flex flex-col items-center justify-center">
      <HomeCoverSection blogs={published} />
      <AboutBand />
      <FeaturedPosts blogs={published} />
      <RecentPosts blogs={published} />
      <EventsPreview />
    </main>
  )
}
