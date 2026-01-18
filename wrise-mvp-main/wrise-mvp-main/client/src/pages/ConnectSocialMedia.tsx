import { ArrowRight, Instagram, Link, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useState } from "react";
import Footer from "@/components/Footer";

const ConnectSocialMedia = () => {
  const navigate = useNavigate();


  const handleConnectInstagram = () => {
    navigate("/connect/instagram");
  };

  const handleConnectYoutube = () => {
    navigate("/connect/youtube");
  };
  const handleUploadPdfFile = () =>{
    navigate("/connect/upload");
  }

  return (
    <>
    <Navbar />
    <section className="flex flex-col items-center justify-center min-h-[80vh] px-4 bg-gradient-to-br from-[#d7c9e4] via-[#b3d2f0] to-[#c5bfcc] text-gray-800">
    {/* Card container */}
    <div className="bg-white/80 backdrop-blur-md rounded-sm shadow-xl p-10 max-w-xl w-full text-center space-y-6">
    {/* Heading and description */}
        <div className="space-y-3">
            <h1 className="text-4xl font-bold text-gray-900">Connect Your Social Media</h1>
            <p className="text-black/80">
                Link your Instagram and YouTube accounts so Wrise can analyze your content, pull new posts automatically, and help you engage with fans in one place.
            </p>
        </div>

    {/* CTA buttons */}
        <div className="grid gap-4 mt-6">
        <Button
            onClick={handleConnectInstagram}
            className="bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] hover:opacity-90 text-white text-lg py-3 rounded-full flex items-center justify-center gap-2 transition duration-300"
        >
            <Instagram size={20} />
            Connect Instagram
        </Button>
        
        <Button
            onClick={handleConnectYoutube}
            className="bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:opacity-90 text-white text-lg py-3 rounded-full flex items-center justify-center gap-2 transition duration-300"
        >
            <Youtube size={20} />
            Connect YouTube
        </Button>
        <Button
            onClick={handleUploadPdfFile}
            className="bg-gradient-to-r from-gray-400 to-gray-500 hover:opacity-90 text-white text-lg py-3 rounded-full flex items-center justify-center gap-2 transition duration-300"
        >
            <Link size={20} />
            Upload PDF
        </Button>
        </div>
    </div>
    </section>

    {/* CTA */}
    <section className="py-20 bg-gradient-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Start Building Your Fan Hub Today
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Connect your accounts, set your price, and launch within minutes.
            No technical skills required.
          </p>
          <Button
            className="bg-white text-wrise-primary hover:bg-white/90 text-lg rounded-full px-8 py-6 h-auto"
            onClick={() => navigate("/onboarding")}
          >
            Create Your Hub <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
    </section>
    <Footer />
    </>
  );
};

export default ConnectSocialMedia;
