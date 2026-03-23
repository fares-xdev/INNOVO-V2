import Header from "@/components/Header";
import Footer from "@/components/Footer";

const AboutUs = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white font-montserrat">
      <Header />

      <main className="flex-grow">
        {/* About Section - Full Width Split */}
        <section className="w-full pb-20 pt-10 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-start">
            {/* Left - Text (5/12) */}
            <div className="lg:col-span-5 px-6 lg:pl-12 lg:pr-8 pb-10 lg:pb-16 pt-0 lg:pt-0 space-y-6">
              <div className="relative pb-4">
                <h2 className="text-2xl lg:text-3xl font-bold text-black uppercase tracking-tight">
                  A Little Bit About Us!
                </h2>
                <div className="absolute bottom-0 left-0 w-20 h-1.5 bg-[#CD2727] rounded-full" />
              </div>

              <div className="space-y-5 text-gray-600 leading-relaxed text-sm">
                <p>
                  Established in 2012, INNOVO came to life with a concept of innovative international designs that put wellbeing in the right, left and center of our office furniture solutions.
                </p>
                <p>
                  Our 360 workplace solutions bring leading European office furniture brands right in the heart of our customers’ offices. From task chairs to complete board rooms, INNOVO offers a smart blend of innovative design, posture health, smart space utilization and unmatched value for money from international office furniture manufacturers, who have been leading the global market for over 50 years.
                </p>
                <p>
                  Because there is no one size fits all, each project carries our customer’s brand story. We dive in our customers’ space and digest their corporate values to tailor an office design that tells their story forward. From brand colors, organizational structure, brand values and corporate manifesto, each project is delivered to blend all aspects of the brand and welcomes employees and guests every day.
                </p>
                <p>
                  Our certified and diligent project management team and skilled technicians work around the clock assuring timely installations with quality, with no disturbances to the business process to deliver each project with the highest level of customer satisfaction. Our duty does not end with our delivery. We offer unique after-sales and preventive maintenance solutions that ensure our customers’ office assets are operating uninterruptedly.
                </p>
              </div>
            </div>

            {/* Right - Image (7/12) */}
            <div className="lg:col-span-7 pr-6 lg:pr-10">
              <img
                src="https://innovo-eg.com/wp-content/uploads/2021/08/raya-scaled.jpg"
                alt="Raya Office"
                className="w-full h-auto rounded-xl"
              />
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <section className="py-20 bg-gray-50">
          <div className="container text-center max-w-3xl">
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-black uppercase mb-4">Our Vision</h2>
              <div className="w-20 h-1.5 bg-[#CD2727] mx-auto rounded-full" />
            </div>
            <p className="text-xl md:text-2xl text-gray-700 leading-relaxed font-medium italic">
              "To be the partner-of-choice by providing innovative work spaces that support our customer success and create an inspirational environment."
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 bg-white">
          <div className="container text-center max-w-3xl">
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-black uppercase mb-4">Our Mission</h2>
              <div className="w-20 h-1.5 bg-[#CD2727] mx-auto rounded-full" />
            </div>
            <p className="text-xl md:text-2xl text-gray-700 leading-relaxed font-medium italic">
              "To provide a well designed and functional office workspace that fits every customer need."
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutUs;
