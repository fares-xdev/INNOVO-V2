import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MapPin, Phone, Mail, Send, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const ContactUs = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Thank you for your message! We'll get back to you soon.");
    setForm({ firstName: "", lastName: "", email: "", phone: "", message: "" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-grow">
        {/* Top Section: Map and Info (70/30 Split) */}
        <section className="w-full bg-[#F9F9F9]">
          <div className="grid grid-cols-1 lg:grid-cols-10">
            {/* Left - Map */}
            <div className="lg:col-span-7 h-[400px] lg:h-[700px] w-full pt-7 bg-[#F9F9F9]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3452.6939853091308!2d31.020623000000008!3d30.074305!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14585ba2d1f5df0f%3A0x700b2c644a5c628d!2sInnovo%20Office%20Furniture!5e0!3m2!1sar!2seg!4v1774293779711!5m2!1sar!2seg"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Maps"
              />
            </div>

            {/* Right - Information */}
            <div className="lg:col-span-3 flex items-center justify-center p-8 lg:p-6 bg-[#F9F9F9]">
              <div className="w-full max-w-xl space-y-12">
                <div className="space-y-4">
                  <span className="text-gray-400 text-sm font-medium tracking-wide">
                    Explore what sets us apart
                  </span>
                  <h2 className="text-2xl lg:text-3xl font-bold text-[#242424] tracking-tight">
                    Connect with us
                  </h2>
                  <p className="text-gray-400 text-base leading-relaxed max-w-md">
                    Why settle for ordinary workspaces? At INNOVO, we believe your environment should echo your identity — thoughtful, functional, and deeply human. Let’s create something exceptional together.
                  </p>
                </div>

                {/* Info Card */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 lg:p-9 space-y-7 shadow-sm">
                  <h3 className="text-3xl font-bold text-[#242424]">Egypt</h3>
                  
                  <div className="space-y-3">
                    {/* Head Office */}
                    <div className="grid grid-cols-1 md:grid-cols-[100px,1fr] gap-2">
                      <p className="text-gray-500 font-medium text-sm">Head Office:</p>
                      <p className="text-gray-500 text-sm leading-relaxed max-w-[280px]">
                        Smart Village, A10 Cairo – Alexandria Desert Rd, Giza Governorate
                      </p>
                    </div>

                    {/* New Cairo */}
                    <div className="grid grid-cols-1 md:grid-cols-[100px,1fr] gap-2">
                      <p className="text-gray-500 font-medium text-sm">New Cairo:</p>
                      <p className="text-gray-400 text-sm font-bold">Coming Soon</p>
                    </div>

                    {/* Phone */}
                    <div className="grid grid-cols-1 md:grid-cols-[100px,1fr] gap-2">
                      <p className="text-gray-500 font-medium text-sm">Phone:</p>
                      <p className="text-gray-500 text-sm font-bold">+20 10-100-402-88</p>
                    </div>

                    {/* Sales */}
                    <div className="grid grid-cols-1 md:grid-cols-[100px,1fr] gap-2">
                      <p className="text-gray-500 font-medium text-sm">Sales:</p>
                      <p className="text-gray-500 text-sm">sales.inquiries@innovo-eg.com</p>
                    </div>

                    {/* Info */}
                    <div className="grid grid-cols-1 md:grid-cols-[100px,1fr] gap-2">
                      <p className="text-gray-500 font-medium text-sm">Info:</p>
                      <p className="text-gray-500 text-sm">info@innovo-eg.com</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Section: Form */}
        <section id="mytarget" className="bg-gray-50 py-24 lg:py-32">
          <div className="container max-w-5xl">
            <div className="text-center mb-16">
              <h4 className="text-3xl lg:text-4xl font-extrabold text-[#242424] mb-6 uppercase tracking-tight">
                Drop your questions below
              </h4>
              <p className="text-gray-500 text-base max-w-2xl mx-auto leading-relaxed">
                Whether it’s design, delivery, or the tiniest detail — we're here to clarify, collaborate, and co-create. Because at INNOVO, every question is a step toward something smarter.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-8 lg:p-16 rounded-3xl shadow-xl border border-gray-100">
              <div className="space-y-2">
                <input
                  required
                  type="text"
                  placeholder="First Name"
                  value={form.firstName}
                  onChange={(e) => setForm({...form, firstName: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#CD2727]/10 focus:bg-white transition-all outline-none text-sm"
                />
              </div>
              <div className="space-y-2">
                <input
                  required
                  type="text"
                  placeholder="Last Name"
                  value={form.lastName}
                  onChange={(e) => setForm({...form, lastName: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#CD2727]/10 focus:bg-white transition-all outline-none text-sm"
                />
              </div>
              <div className="space-y-2">
                <input
                  required
                  type="email"
                  placeholder="Your Email Address"
                  value={form.email}
                  onChange={(e) => setForm({...form, email: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#CD2727]/10 focus:bg-white transition-all outline-none text-sm"
                />
              </div>
              <div className="space-y-2">
                <input
                  required
                  type="text"
                  placeholder="Your Number"
                  value={form.phone}
                  onChange={(e) => setForm({...form, phone: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#CD2727]/10 focus:bg-white transition-all outline-none text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <textarea
                  placeholder="Message"
                  rows={6}
                  value={form.message}
                  onChange={(e) => setForm({...form, message: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#CD2727]/10 focus:bg-white transition-all outline-none text-sm resize-none"
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full md:w-auto px-16 py-5 bg-[#CD2727] text-white rounded-xl font-bold uppercase tracking-widest hover:bg-[#242424] transition-all duration-300 shadow-lg shadow-[#CD2727]/20 active:scale-95"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ContactUs;
