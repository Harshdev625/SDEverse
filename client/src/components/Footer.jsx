import { Link } from "react-router-dom";
import { Twitter, Linkedin, Github } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div>
            <h3 className="text-lg font-bold mb-2">SDEverse</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your ultimate platform for mastering DSA with community collaboration.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Navigation</h4>
            <ul className="space-y-1 text-gray-600 dark:text-gray-400">
              <li><Link to="/" className="hover:underline">Home</Link></li>
              <li><Link to="/algorithms" className="hover:underline">Algorithms</Link></li>
              <li><Link to="/contributions" className="hover:underline">Contributions</Link></li>
              <li><Link to="/about" className="hover:underline">About</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Resources</h4>
            <ul className="space-y-1 text-gray-600 dark:text-gray-400">
              <li><Link to="/faq" className="hover:underline">FAQs</Link></li>
              <li><Link to="/blog" className="hover:underline">Blog</Link></li>
              <li><Link to="/contact" className="hover:underline">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Connect</h4>
            <p className="text-gray-600 dark:text-gray-400 mb-2">Follow us on:</p>
            <div className="flex flex-col space-y-2">
              <a href="#" className="hover:text-blue-500 dark:hover:text-blue-400 flex items-center gap-1">
                <Twitter size={18} /> Twitter
              </a>
              <a href="#" className="hover:text-blue-600 dark:hover:text-blue-500 flex items-center gap-1">
                <Linkedin size={18} /> LinkedIn
              </a>
              <a href="#" className="hover:text-pink-500 dark:hover:text-pink-400 flex items-center gap-1">
                <Github size={18} /> GitHub
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-gray-500 dark:text-gray-500">
          &copy; {new Date().getFullYear()} SDEverse. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
