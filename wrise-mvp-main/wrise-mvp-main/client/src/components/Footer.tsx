import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <>
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-primary rounded-lg w-8 h-8 flex items-center justify-center">
                  <span className="font-bold text-white">W</span>
                </div>
                <span className="font-bold text-xl">Wrise</span>
              </div>
              <p className="text-gray-400 mt-2 text-sm">
                Turn your content into conversations.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-bold mb-4">Platform</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                  <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                  <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-bold mb-4">Company</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-bold mb-4">Legal</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center md:text-left text-sm text-gray-400">
            <p>© {new Date().getFullYear()} Wrise. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  )
}

export default Footer