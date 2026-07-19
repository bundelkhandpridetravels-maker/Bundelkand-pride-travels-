import IntroAnimation from "@/components/hero/IntroAnimation";
import Navbar from "@/components/site/Navbar";
import Hero from "@/components/hero/Hero";
import WhyUs from "@/components/home/WhyUs";
import Categories from "@/components/home/Categories";
import FeaturedPackages from "@/components/home/FeaturedPackages";
import DeparturesBoard from "@/components/home/DeparturesBoard";
import Testimonials from "@/components/home/Testimonials";
import AiPlanning from "@/components/home/AiPlanning";
import Gallery from "@/components/home/Gallery";
import Journal from "@/components/home/Journal";
import Faq from "@/components/home/Faq";
import Newsletter from "@/components/home/Newsletter";
import Footer from "@/components/site/Footer";

export default function HomePage() {
  return (
    <>
      <IntroAnimation />
      <Navbar />
      <main className="flex-1">
        <Hero />
        <WhyUs />
        <Categories />
        <FeaturedPackages />
        <DeparturesBoard />
        <Testimonials />
        <AiPlanning />
        <Gallery />
        <Journal />
        <Faq />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
