import { motion } from "framer-motion";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  MessageSquare, 
  Clock, 
  Globe2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const contactDetails = [
  {
    icon: <Phone className="w-5 h-5 text-chart-1" />,
    title: "Direct Line",
    value: "+1 (555) 000-1234",
    desc: "Mon-Fri from 9am to 6pm."
  },
  {
    icon: <Mail className="w-5 h-5 text-chart-2" />,
    title: "Email Support",
    value: "support@garmenttrack.com",
    desc: "Our team responds within 24h."
  },
  {
    icon: <MapPin className="w-5 h-5 text-chart-3" />,
    title: "Main Headquarters",
    value: "123 Industrial Ave, NY",
    desc: "Global Operations Center"
  }
];

const Contact = () => {
  return (
    <div className="bg-background min-h-screen">
      {/* 1. Header Section */}
      <section className="py-24 border-b border-border/50 bg-primary/[0.01]">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 text-chart-4 font-black uppercase tracking-[0.3em] text-xs mb-4"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Connect With Us</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tighter mb-6"
          >
            Let's Talk <br /> <span className="text-muted-foreground font-light italic text-4xl md:text-6xl">Production.</span>
          </motion.h1>
        </div>
      </section>

      {/* 2. Main Content Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Left Column: Information */}
            <div className="lg:col-span-5 space-y-12">
              <div>
                <h2 className="text-3xl font-bold mb-6">Partnering for <span className="text-chart-1">Scale.</span></h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Whether you are a factory owner looking to digitize or a buyer seeking transparency, 
                  our team is ready to assist your integration.
                </p>
              </div>

              <div className="space-y-6">
                {contactDetails.map((item, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ x: 10 }}
                    className="flex gap-6 p-6 rounded-2xl border border-border bg-card/50 transition-colors hover:border-primary/30"
                  >
                    <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center shrink-0 shadow-sm">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">{item.title}</h4>
                      <p className="text-lg font-medium mb-1">{item.value}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Operating Badge */}
              <div className="p-8 rounded-3xl bg-accent/50 border border-border flex items-center gap-6">
                <div className="relative">
                   <Globe2 className="w-12 h-12 text-chart-2" />
                   <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-background" />
                </div>
                <div>
                   <p className="font-bold">Global Network Status</p>
                   <p className="text-sm text-muted-foreground">All regional tracking servers operational.</p>
                </div>
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="lg:col-span-7"
            >
              <div className="p-8 md:p-12 rounded-3xl bg-card border border-border shadow-2xl relative overflow-hidden">
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                
                <form className="space-y-6 relative z-10" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                      <Input placeholder="John Doe" className="h-12 bg-background border-border" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Work Email</label>
                      <Input type="email" placeholder="john@factory.com" className="h-12 bg-background border-border" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Inquiry Type</label>
                    <select className="flex h-12 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                      <option>General Inquiry</option>
                      <option>Manager Partnership</option>
                      <option>Buyer Account Support</option>
                      <option>Technical Issue</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Message</label>
                    <Textarea 
                      placeholder="How can we help your production workflow?" 
                      className="min-h-[150px] bg-background border-border resize-none" 
                    />
                  </div>

                  <Button className="w-full h-14 text-lg font-bold gap-2 group shadow-xl shadow-primary/20">
                    Send Message <Send className="w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </Button>
                </form>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 3. Global Reach Map Placeholder */}
      <section className="pb-24 px-6">
        <div className="container mx-auto h-[400px] rounded-3xl bg-muted border border-border flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/world-map.png')] opacity-20 group-hover:scale-105 transition-transform duration-1000" />
            <div className="text-center z-10">
                <Clock className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-bold italic text-muted-foreground">Interactive Operations Map coming soon.</h3>
                <p className="text-sm text-muted-foreground/60">Supporting production hubs in 12 countries.</p>
            </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;