import React from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import ContactForm from "../../components/forms/ContactForm";

const Contact = () => {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="w-full max-w-3xl mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Get in Touch
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Have a question, feedback, or collaboration idea? Fill out the form
            below — we’d love to hear from you!
          </p>
        </div>

        {/* Centered Contact Form */}
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6 text-center">
            Send us a message
          </h2>
          <ContactForm />
        </div>
      </div>
    </section>
  );
};

export default Contact;
