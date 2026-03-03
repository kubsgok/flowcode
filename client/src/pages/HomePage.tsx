import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Code2,
  Target,
  TrendingUp,
  Lightbulb,
  ArrowRight,
  LogOut,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { TextEffect } from '../components/ui/text-effect';
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useAnimationFrame,
  useScroll,
  useTransform,
} from 'framer-motion';


function GridPattern({
  offsetX,
  offsetY,
  id,
}: {
  offsetX: ReturnType<typeof useMotionValue<number>>;
  offsetY: ReturnType<typeof useMotionValue<number>>;
  id: string;
}) {
  return (
    <svg className="w-full h-full">
      <defs>
        <motion.pattern
          id={id}
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
          x={offsetX}
          y={offsetY}
        >
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-slate-500"
          />
        </motion.pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

export function HomePage() {
  const { user, isAuthenticated, logout } = useAuth();

  // Mouse position in viewport coordinates (works across the whole page)
  const mouseX = useMotionValue(-9999);
  const mouseY = useMotionValue(-9999);

  const handleMouseMove = (e: React.MouseEvent) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };

  // Scrolling grid offset
  const gridOffsetX = useMotionValue(0);
  const gridOffsetY = useMotionValue(0);

  useAnimationFrame(() => {
    gridOffsetX.set((gridOffsetX.get() + 0.5) % 40);
    gridOffsetY.set((gridOffsetY.get() + 0.5) % 40);
  });

  const maskImage = useMotionTemplate`radial-gradient(300px circle at ${mouseX}px ${mouseY}px, black, transparent)`;

  return (
    <div className="min-h-screen bg-slate-900" onMouseMove={handleMouseMove}>

      {/* Full-page grid background — fixed so it persists through scrolling */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.05]">
        <GridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} id="grid-base" />
      </div>
      <motion.div
        className="fixed inset-0 z-0 pointer-events-none opacity-40"
        style={{ maskImage, WebkitMaskImage: maskImage }}
      >
        <GridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} id="grid-reveal" />
      </motion.div>

      {/* Ambient color blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute right-[-10%] top-[-10%] w-[35%] h-[35%] rounded-full bg-orange-500/20 blur-[120px]" />
        <div className="absolute right-[15%] top-[5%] w-[20%] h-[20%] rounded-full bg-primary-500/20 blur-[100px]" />
        <div className="absolute left-[-10%] bottom-[-10%] w-[35%] h-[35%] rounded-full bg-blue-500/20 blur-[120px]" />
      </div>

      {/* All page content sits above the grid */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-slate-800/60 backdrop-blur-sm bg-slate-900/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2">
                <Code2 className="w-8 h-8 text-primary-500" />
                <span className="text-xl font-bold text-white">FlowCode</span>
              </div>

              <nav className="flex items-center gap-4">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/problems"
                      className="text-slate-300 hover:text-white transition-colors"
                    >
                      Problems
                    </Link>
                    <span className="text-slate-400">|</span>
                    <span className="text-slate-300">{user?.displayName}</span>
                    <button
                      onClick={logout}
                      className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="text-slate-300 hover:text-white transition-colors"
                    >
                      Sign in
                    </Link>
                    <Link to="/register" className="btn btn-primary">
                      Get Started
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <HeroContent isAuthenticated={isAuthenticated} />

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.5 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="text-3xl font-bold text-white text-center mb-12"
            >
              Why FlowCode?
            </motion.h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: <Target className="w-8 h-8" />, title: 'Guided Mode', description: 'Daily challenges tailored to your skill level. Build streaks, track progress, and let our algorithm guide your learning journey.', delay: 0 },
                { icon: <TrendingUp className="w-8 h-8" />, title: 'Skill Tracking', description: 'Track your progress across 20+ concepts including arrays, dynamic programming, graphs, and more.', delay: 0.1 },
                { icon: <Lightbulb className="w-8 h-8" />, title: 'AI-Powered Hints', description: 'Stuck? Get personalized hints powered by AI that analyze your code and guide you to the solution.', delay: 0.2 },
              ].map(({ icon, title, description, delay }) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ duration: 0.5, ease: 'easeOut', delay }}
                  className="h-full"
                >
                  <FeatureCard icon={icon} title={title} description={description} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        {!isAuthenticated && (
          <section className="py-20 px-4">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.4 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="max-w-2xl mx-auto text-center"
            >
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to level up your coding skills?
              </h2>
              <p className="text-slate-400 mb-8">
                Join thousands of developers who are improving their problem-solving
                abilities with personalized practice.
              </p>
              <Link to="/register" className="btn btn-primary text-lg px-8 py-3">
                Create Free Account
              </Link>
            </motion.div>
          </section>
        )}

        {/* Footer */}
        <footer className="border-t border-slate-800/60 py-8 px-4">
          <div className="max-w-6xl mx-auto text-center text-slate-500">
            <p>Built with React, Node.js, and MongoDB</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

function HeroContent({ isAuthenticated }: { isAuthenticated: boolean }) {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const translateY = useTransform(scrollY, [0, 400], [0, -60]);

  return (
    <motion.section
      style={{ opacity, y: translateY }}
      className="min-h-[calc(100vh-4rem)] px-4 flex items-center justify-center"
    >
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6">
          <TextEffect per='char' as='span' className='inline-block whitespace-nowrap' variants={{ container: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.03 } } }, item: { hidden: { opacity: 0, filter: 'blur(10px)' }, visible: { opacity: 1, filter: 'blur(0px)', transition: { duration: 0.4, ease: 'easeOut' } } } }}>{"Master Coding with "}</TextEffect>
          <TextEffect per='char' as='span' delay={0.57} className='inline-block whitespace-nowrap text-primary-500' variants={{ container: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.03 } } }, item: { hidden: { opacity: 0, filter: 'blur(10px)' }, visible: { opacity: 1, filter: 'blur(0px)', transition: { duration: 0.4, ease: 'easeOut' } } } }}>{"Guided"}</TextEffect>
          <TextEffect per='char' as='span' delay={0.75} className='inline-block whitespace-nowrap' variants={{ container: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.03 } } }, item: { hidden: { opacity: 0, filter: 'blur(10px)' }, visible: { opacity: 1, filter: 'blur(0px)', transition: { duration: 0.4, ease: 'easeOut' } } } }}>{" Practice"}</TextEffect>
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto"
        >
          An adaptive platform that personalizes your learning journey.
          Get problem recommendations tailored to your skill level and
          watch yourself improve.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button asChild size="xl" className="group bg-primary-600 hover:bg-primary-700">
            <Link to={isAuthenticated ? '/problems' : '/register'}>
              Start Practicing
              <ArrowRight className="-me-1 ms-2 opacity-60 transition-transform group-hover:translate-x-0.5" size={18} strokeWidth={2} />
            </Link>
          </Button>
        </motion.div>
      </div>
    </motion.section>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="card p-6 h-full transition-all duration-300 hover:scale-105 hover:bg-slate-700/50 hover:border-primary-500/50 hover:shadow-lg hover:shadow-primary-500/10 cursor-pointer">
      <div className="w-12 h-12 rounded-lg bg-primary-500/10 text-primary-500 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400">{description}</p>
    </div>
  );
}
