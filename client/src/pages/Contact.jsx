import React from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import ContactForm from "../components/forms/ContactForm";

const Contact = () => {
  return (
    <section className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Header Section */}
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Get in Touch
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Have a question, feedback, or collaboration idea?  
            Fill out the form below or reach out through our contact details — we’d love to hear from you!
          </p>
        </div>

        {/* Contact Info + Form */}
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left Column: Contact Info */}
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                <Mail className="text-indigo-600 dark:text-indigo-400" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Email</h3>
                <p className="text-gray-600 dark:text-gray-400">support@sdeverse.com</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                <Phone className="text-indigo-600 dark:text-indigo-400" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Phone</h3>
                <p className="text-gray-600 dark:text-gray-400">+91 98765 43210</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                <MapPin className="text-indigo-600 dark:text-indigo-400" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Location</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  SDEverse Pvt. Ltd. <br />
                  91Springboard, Sector 18, Gurugram, Haryana 122015, India
                </p>
              </div>
            </div>

            <div className="mt-10 text-gray-600 dark:text-gray-400 text-sm">
              <p>
                Our support team typically replies within <span className="font-semibold">24–48 hours</span>.
              </p>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
              Send us a message
            </h2>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
