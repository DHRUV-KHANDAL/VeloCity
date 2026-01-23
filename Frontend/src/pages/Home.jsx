// src/pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import {
  Clock,
  DollarSign,
  Shield,
  Star,
  Car,
  MapPin,
  Users,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: Clock,
      title: "Fast Booking",
      description: "Get a ride in under 2 minutes",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: DollarSign,
      title: "Best Prices",
      description: "Competitive pricing with no hidden fees",
      color: "from-green-500 to-green-600",
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "All drivers verified, rides tracked real-time",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Star,
      title: "5-Star Service",
      description: "Rated 4.9/5 by thousands",
      color: "from-yellow-500 to-yellow-600",
    },
  ];

  const stats = [
    { value: "50K+", label: "Happy Riders", icon: Users },
    { value: "10K+", label: "Verified Drivers", icon: Car },
    { value: "100+", label: "Cities Covered", icon: MapPin },
    { value: "4.9★", label: "Average Rating", icon: Star },
  ];

  const steps = [
    {
      num: "1",
      title: "Book a Ride",
      desc: "Enter pickup & dropoff locations",
      icon: MapPin,
    },
    {
      num: "2",
      title: "Choose Ride",
      desc: "Select economy, comfort, or premium",
      icon: Car,
    },
    {
      num: "3",
      title: "Track Driver",
      desc: "Watch driver approach in real-time",
      icon: Clock,
    },
    { num: "4", title: "Enjoy Ride", desc: "Sit back and relax", icon: Star },
  ];

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @keyframes heroGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.2); }
          50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.8), 0 0 60px rgba(59, 130, 246, 0.4); }
        }
        
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-glow {
          animation: glow 3s ease-in-out infinite;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .hero-background {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%);
          background-size: 400% 400%;
          animation: heroGradient 15s ease infinite;
          position: relative;
          overflow: hidden;
        }
        
        .hero-background::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                      radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
          pointer-events: none;
        }
        
        .card-shimmer {
          position: relative;
          overflow: hidden;
        }
        
        .card-shimmer::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          animation: shimmer 3s infinite;
        }
        
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        
        .feature-card {
          position: relative;
          transition: all 0.3s ease;
        }
        
        .feature-card:hover {
          transform: translateY(-10px);
        }
        
        .step-card {
          position: relative;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          border: none;
        }
        
        .step-card:hover {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        
        .step-card:hover h3,
        .step-card:hover p {
          color: white;
        }
        
        .step-num {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .step-card:hover .step-num {
          background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%);
        }
      `}</style>

      {/* Hero Section */}
      <section className="hero-background relative text-white overflow-hidden py-32">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-float"></div>
          <div
            className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-6xl sm:text-7xl font-black mb-6 leading-tight">
              Your Journey,
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-yellow-100">
                Reimagined
              </span>
            </h1>
            <p className="text-2xl text-white/90 mb-10 font-light">
              Experience the future of urban mobility with VeloCity
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!user ? (
                <>
                  <Link
                    to="/register"
                    className="px-8 py-4 bg-white text-purple-600 font-bold rounded-lg hover:bg-yellow-100 transition-all duration-200 flex items-center justify-center gap-2 group shadow-lg hover:shadow-2xl transform hover:scale-105"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/login"
                    className="px-8 py-4 bg-white/20 backdrop-blur-md border-2 border-white text-white font-bold rounded-lg hover:bg-white/40 transition-all duration-200 transform hover:scale-105"
                  >
                    Sign In
                  </Link>
                </>
              ) : (
                <Link
                  to={user.role === "driver" ? "/driver" : "/rider"}
                  className="px-8 py-4 bg-white text-purple-600 font-bold rounded-lg hover:bg-yellow-100 transition-all duration-200 flex items-center justify-center gap-2 group shadow-lg hover:shadow-2xl transform hover:scale-105"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="card-shimmer bg-white/20 backdrop-blur-lg rounded-xl p-6 text-center border border-white/30 hover:bg-white/30 transition-all transform hover:scale-110"
              >
                <div className="flex justify-center mb-3">
                  <div className="h-12 w-12 rounded-full bg-white/30 flex items-center justify-center animate-glow">
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-black mb-1">{stat.value}</div>
                <div className="text-white/80 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black text-gray-900 mb-4">
              Why{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                VeloCity
              </span>{" "}
              Leads
            </h2>
            <p className="text-xl text-gray-600 font-light">
              Redefining urban transportation with cutting-edge technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feat, i) => (
              <div
                key={i}
                className="feature-card card-shimmer bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-2xl"
              >
                <div
                  className={`h-16 w-16 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center mb-6 animate-glow`}
                >
                  <feat.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {feat.title}
                </h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  {feat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl transform -translate-x-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black text-white mb-4">
              Simple Steps to
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                {" "}
                Your Ride
              </span>
            </h2>
            <p className="text-xl text-gray-300 font-light">
              From booking to destination in minutes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative group">
                <div className="step-card rounded-2xl p-8 text-center cursor-pointer transform transition-all duration-300">
                  <div className="step-num h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-300">
                    <span className="text-2xl font-black text-white">
                      {step.num}
                    </span>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-white/20 transition-colors">
                    <step.icon className="h-6 w-6 text-gray-700 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-white transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 group-hover:text-white/90 font-light transition-colors">
                    {step.desc}
                  </p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 z-20">
                    <div className="h-2 w-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full group-hover:w-12 transition-all"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-black mb-6">
            Ready to Transform Your Commute?
          </h2>
          <p className="text-2xl text-white/90 mb-10 font-light">
            Join thousands of satisfied users revolutionizing urban mobility
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user ? (
              <>
                <Link
                  to="/register"
                  className="px-8 py-4 bg-white text-purple-600 font-bold rounded-lg hover:bg-yellow-100 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Create Account
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-4 bg-white/20 backdrop-blur-md border-2 border-white text-white font-bold rounded-lg hover:bg-white/40 transition-all duration-200 transform hover:scale-105"
                >
                  Sign In
                </Link>
              </>
            ) : (
              <Link
                to={user.role === "driver" ? "/driver" : "/rider"}
                className="px-8 py-4 bg-white text-purple-600 font-bold rounded-lg hover:bg-yellow-100 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
