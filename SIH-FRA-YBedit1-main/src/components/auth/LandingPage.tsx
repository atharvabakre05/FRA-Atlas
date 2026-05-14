import React from 'react';
import { TreePine, Shield, Users, MapPin, ArrowRight, Leaf, Mountain, Droplets, Smartphone, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LandingPageProps {
  onEmployeeLogin: (role: 'gp_admin' | 'sdlc_admin' | 'dlc_admin' | 'slmc_admin') => void;
  onPublicLogin: () => void;
  onModernAuth: () => void;
  onUserAuth: () => void;
  onPasswordReset: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEmployeeLogin, onPublicLogin, onModernAuth, onUserAuth, onPasswordReset }) => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-neutral-bg forest-pattern flex flex-col">
      {/* Hero Section */}
      <div className="hero-section relative flex-grow">
        <div className="absolute inset-0 bg-gradient-to-br from-forest-primary/20 to-forest-accent/10"></div>

        {/* Floating Forest Elements */}
        <div className="absolute top-20 left-10 w-12 h-12 text-forest-light/20 animate-forest-float">
          <TreePine className="w-full h-full" />
        </div>
        <div className="absolute top-40 right-20 w-10 h-10 text-forest-light/15 animate-forest-float-delayed">
          <Leaf className="w-full h-full" />
        </div>
        <div className="absolute bottom-40 left-1/4 w-12 h-12 text-forest-light/10 animate-forest-float">
          <Mountain className="w-full h-full" />
        </div>
        <div className="absolute top-60 right-1/3 w-8 h-8 text-forest-light/20 animate-forest-float-delayed">
          <Droplets className="w-full h-full" />
        </div>

        <div className="relative px-6 py-24">
          <div className="max-w-7xl mx-auto text-center">
            {/* Main Logo and Title */}
            <div className="flex items-center justify-center mb-12">
              <div className="p-6 bg-white/20 backdrop-blur-md rounded-3xl shadow-2xl mr-6 border border-white/30">
                <TreePine className="h-16 w-16 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-6xl font-extrabold text-white drop-shadow-lg">FRA Atlas</h1>
                <p className="text-2xl text-white font-light drop-shadow-md">
                  AI-Powered WebGIS Decision Support System
                </p>
                <p className="text-lg text-white font-light drop-shadow-sm">
                  Forest Rights Act Implementation Portal
                </p>
              </div>
            </div>

            {/* Hero Description */}
            <div className="max-w-5xl mx-auto mb-16">
              <p className="text-xl text-white leading-relaxed font-light drop-shadow-md">
                Empowering Forest Rights Act implementation through advanced geospatial analysis,
                AI-driven insights, and comprehensive decision support tools for government officials
                and tribal communities across India.
              </p>
              <p className="mt-4 text-lg text-white italic">
                "Empowering Communities through FRA + AI + GIS"
              </p>
            </div>

            {/* Main Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-16">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => onEmployeeLogin('gp_admin')}
                  className="group forest-button-primary text-lg py-5 px-6 bg-white/30 backdrop-blur-md border-2 border-white/50 hover:bg-white/40 hover:border-white/70 transform hover:scale-105 transition-all duration-500 rounded-2xl shadow-2xl"
                >
                  <div className="flex items-center justify-center space-x-3">
                    <div className="p-2 bg-white/30 rounded-xl">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-base text-white">GP Admin</div>
                      <div className="text-xs text-white">Gram Sabha</div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-white group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                </button>
                <button
                  onClick={() => onEmployeeLogin('sdlc_admin')}
                  className="group forest-button-primary text-lg py-5 px-6 bg-white/30 backdrop-blur-md border-2 border-white/50 hover:bg-white/40 hover:border-white/70 transform hover:scale-105 transition-all duration-500 rounded-2xl shadow-2xl"
                >
                  <div className="flex items-center justify-center space-x-3">
                    <div className="p-2 bg-white/30 rounded-xl">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-base text-white">SDLC Admin</div>
                      <div className="text-xs text-white">Sub-Divisional</div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-white group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                </button>
                <button
                  onClick={() => onEmployeeLogin('dlc_admin')}
                  className="group forest-button-primary text-lg py-5 px-6 bg-white/30 backdrop-blur-md border-2 border-white/50 hover:bg-white/40 hover:border-white/70 transform hover:scale-105 transition-all duration-500 rounded-2xl shadow-2xl"
                >
                  <div className="flex items-center justify-center space-x-3">
                    <div className="p-2 bg-white/30 rounded-xl">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-base text-white">DLC Admin</div>
                      <div className="text-xs text-white">District Level</div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-white group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                </button>
                <button
                  onClick={() => onEmployeeLogin('slmc_admin')}
                  className="group forest-button-primary text-lg py-5 px-6 bg-white/30 backdrop-blur-md border-2 border-white/50 hover:bg-white/40 hover:border-white/70 transform hover:scale-105 transition-all duration-500 rounded-2xl shadow-2xl"
                >
                  <div className="flex items-center justify-center space-x-3">
                    <div className="p-2 bg-white/30 rounded-xl">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-base text-white">SLMC Admin</div>
                      <div className="text-xs text-white">State Monitoring</div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-white group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                </button>
              </div>

              <button
                onClick={onUserAuth}
                className="group forest-button-primary text-lg py-6 px-8 bg-white/30 backdrop-blur-md border-2 border-white/50 hover:bg-white/40 hover:border-white/70 transform hover:scale-105 transition-all duration-500 rounded-3xl shadow-2xl"
              >
                <div className="flex items-center justify-center space-x-3">
                  <div className="p-2 bg-white/30 rounded-xl">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-xl text-white">Public Claim Submission</div>
                    <div className="text-sm text-white">Submit Your FRA Claim</div>
                  </div>
                  <ArrowRight className="h-6 w-6 text-white group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </button>
            </div>


            {/* Features Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-0">
              <div className="forest-card-elevated text-center bg-white shadow-xl">
                <div className="p-6 bg-forest-accent rounded-2xl w-fit mx-auto mb-6 shadow-lg">
                  <MapPin className="h-10 w-10 text-white" />
                </div>
                <h4 className="text-2xl font-semibold text-forest-deep mb-4">Interactive Mapping</h4>
                <p className="text-forest-deep text-lg leading-relaxed">
                  Explore FRA claims and land use patterns with advanced WebGIS technology
                </p>
              </div>

              <div className="forest-card-elevated text-center bg-white shadow-xl">
                <div className="p-6 bg-forest-accent rounded-2xl w-fit mx-auto mb-6 shadow-lg">
                  <TreePine className="h-10 w-10 text-white" />
                </div>
                <h4 className="text-2xl font-semibold text-forest-deep mb-4">Forest Rights</h4>
                <p className="text-forest-deep text-lg leading-relaxed">
                  Secure land rights for tribal communities through transparent processes
                </p>
              </div>

              <div className="forest-card-elevated text-center bg-white shadow-xl">
                <div className="p-6 bg-forest-accent rounded-2xl w-fit mx-auto mb-6 shadow-lg">
                  <Shield className="h-10 w-10 text-white" />
                </div>
                <h4 className="text-2xl font-semibold text-forest-deep mb-4">Secure Platform</h4>
                <p className="text-forest-deep text-lg leading-relaxed">
                  Protected access with role-based authentication and data security
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#013220] text-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="flex items-center mb-2">
              <TreePine className="h-5 w-5 text-white mr-2" />
              <span className="text-lg font-bold text-white">FRA Atlas</span>
            </div>
            <p className="text-white text-xs mb-2 leading-relaxed">
              Forest Rights Act Implementation Portal • Ministry of Tribal Affairs
            </p>
            <p className="text-white text-xs">
              Empowering communities through technology and transparency
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-2">Quick Links</h4>
            <ul className="space-y-1">
              <li><a href="#" className="hover:text-green-300 text-xs text-white">Submit Claim</a></li>
              <li><a href="#" className="hover:text-green-300 text-xs text-white">FRA Atlas</a></li>
              <li><a href="#" className="hover:text-green-300 text-xs text-white">Document Review</a></li>
              <li><a href="#" className="hover:text-green-300 text-xs text-white">DSS Schemes</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-2">Contact</h4>
            <ul className="space-y-1">
              <li className="text-xs text-white">Ministry of Tribal Affairs</li>
              <li className="text-xs text-white">Government of India</li>
              <li className="text-xs text-white">New Delhi, India</li>
              <li className="text-xs text-white">Email: support@fra.gov.in</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/50 mt-4 pt-3 text-center">
          <p className="text-xs text-white">
            © 2025 FRA Atlas. All rights reserved. | Privacy Policy | Terms of Service
          </p>
        </div>
      </footer>
    </div>
  );
};
