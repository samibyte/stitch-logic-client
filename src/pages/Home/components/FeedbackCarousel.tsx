import { motion } from "framer-motion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Robert Fox",
    role: "Supply Chain Manager",
    company: "Elite Threads Co.",
    content:
      "The real-time tracking of the sewing phase has reduced our delivery delays by 40%. This system is a game-changer.",
    rating: 5,
    image: "https://i.pravatar.cc/150?u=robert",
  },
  {
    id: 2,
    name: "Jane Cooper",
    role: "Fashion Buyer",
    company: "Urban Vogue",
    content:
      "Transparency in the 'Cutting' and 'Finishing' stages builds so much trust. I exactly know when to expect my shipment.",
    rating: 5,
    image: "https://i.pravatar.cc/150?u=jane",
  },
  {
    id: 3,
    name: "Cody Fisher",
    role: "Production Supervisor",
    company: "Global Garments",
    content:
      "Managing 12 different production lines became effortless. The dashboard interface is clean and status updates are instant.",
    rating: 5,
    image: "https://i.pravatar.cc/150?u=cody",
  },
];

const FeedbackCarousel = () => {
  return (
    <section className="bg-background relative overflow-hidden py-24">
      {/* Decorative background blur */}
      <div className="bg-primary/5 absolute top-1/2 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]" />

      <div className="container mx-auto px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-chart-2 mb-4 flex items-center justify-center gap-2 text-xs font-black tracking-[0.2em] uppercase"
          >
            <Quote className="h-4 w-4" />
            <span>Success Stories</span>
          </motion.div>
          <h2 className="text-foreground text-4xl font-black tracking-tight md:text-5xl">
            Trusted by the <br />{" "}
            <span className="text-muted-foreground">Modern Factory.</span>
          </h2>
        </div>

        <div className="mx-auto max-w-5xl px-12">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {testimonials.map((item) => (
                <CarouselItem
                  key={item.id}
                  className="pl-4 md:basis-1/2 lg:basis-1/2"
                >
                  <Card className="border-border bg-card/50 hover:border-primary/30 h-full overflow-hidden rounded-3xl backdrop-blur-sm transition-colors duration-300">
                    <CardContent className="flex h-full flex-col p-8 md:p-10">
                      <div className="mb-6 flex gap-1">
                        {[...Array(item.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="fill-chart-4 text-chart-4 h-4 w-4"
                          />
                        ))}
                      </div>

                      <p className="text-foreground mb-8 flex-grow text-lg leading-relaxed font-medium italic">
                        "{item.content}"
                      </p>

                      <div className="border-border/50 flex items-center gap-4 border-t pt-6">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="border-border h-12 w-12 rounded-full border shadow-sm"
                        />
                        <div>
                          <h4 className="text-foreground mb-1 text-base leading-none font-bold">
                            {item.name}
                          </h4>
                          <p className="text-muted-foreground text-xs">
                            {item.role} @{" "}
                            <span className="text-chart-2 font-semibold">
                              {item.company}
                            </span>
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Custom Styled Navigation */}
            <div className="mt-12 flex justify-center gap-4">
              <CarouselPrevious className="border-border hover:bg-accent static h-12 w-12 translate-y-0" />
              <CarouselNext className="bg-primary text-primary-foreground shadow-primary/20 static h-12 w-12 translate-y-0 shadow-lg hover:opacity-90" />
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default FeedbackCarousel;
