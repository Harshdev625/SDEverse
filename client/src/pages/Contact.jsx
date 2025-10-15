import React from "react";
import ContactForm from "../components/forms/ContactForm";

const Contact = () => {
  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-8 md:p-10">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Contact Us
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Have a question, suggestion, or just want to say hello? Fill out the form below.
        </p>
        <ContactForm />
      </div>
    </section>
  );
};

export default Contact;
