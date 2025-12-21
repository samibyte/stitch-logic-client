import FeedbackCarousel from "../components/FeedbackCarousel";
import HeroBanner from "../components/HeroBanner";
import HowItWorks from "../components/HowItWorks";
import OurProducts from "../components/OurProducts";
import ProductionHeatmap from "../components/ProductionHeatmap";
import QualityThread from "../components/QualityThread";

const Home = () => {
  return (
    <div>
      <HeroBanner />
      <OurProducts />
      <HowItWorks />
      <FeedbackCarousel />
      <ProductionHeatmap />
      <QualityThread />
    </div>
  );
};

export default Home;
