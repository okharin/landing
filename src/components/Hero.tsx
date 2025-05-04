import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="pt-32 pb-20 md:pt-40 md:pb-24 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-[30%] -left-[10%] w-[500px] h-[500px] bg-duomind-purple/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[400px] h-[400px] bg-duomind-blue/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="w-full md:w-1/2 space-y-8 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-montserrat leading-tight">
              Два разума.<br/>
              <span className="gradient-text">Один результат.</span>
            </h1>
            
            <p className="text-xl md:text-2xl font-medium text-gray-700">
              Виртуальная AI-команда, которая выполняет аналитические и исследовательские задачи — вместо тебя.
            </p>
            
            <p className="text-gray-600">
              DuoMind — это не просто ИИ. Это мультиагентная система, где каждый агент работает на результат: анализирует данные, читает документы, пишет отчёты и предлагает решения.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-duomind-purple hover:bg-duomind-purple/90 text-white font-medium py-6 px-6 rounded-lg flex items-center gap-2 text-base">
                Попробовать сейчас
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button variant="outline" className="border-duomind-purple text-duomind-purple hover:bg-duomind-purple/5 font-medium py-6 px-6 rounded-lg text-base">
                Записаться на демо
              </Button>
            </div>
          </div>
          
          <div className="w-full md:w-1/2 flex justify-center items-center">
            <div className="relative">
              <div className="w-[280px] h-[280px] md:w-[400px] md:h-[400px] bg-gradient-to-br from-duomind-purple to-duomind-blue rounded-full opacity-90 blur-xl absolute z-0 animate-pulse" />
              
              <div className="relative z-10 animate-floating">
                <svg width="350" height="350" viewBox="0 0 350 350" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M175 350C271.65 350 350 271.65 350 175C350 78.35 271.65 0 175 0C78.35 0 0 78.35 0 175C0 271.65 78.35 350 175 350Z" fill="url(#paint0_radial_0_1)" />
                  <circle cx="130" cy="175" r="40" fill="white" fillOpacity="0.9" />
                  <circle cx="220" cy="175" r="40" fill="white" fillOpacity="0.9" />
                  <defs>
                    <radialGradient id="paint0_radial_0_1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(175 175) rotate(90) scale(175)">
                      <stop offset="0" stopColor="#7C3AED" stopOpacity="0.2" />
                      <stop offset="1" stopColor="#4F46E5" stopOpacity="0.1" />
                    </radialGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;