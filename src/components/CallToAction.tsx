import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CallToAction = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-[30%] -right-[10%] w-[500px] h-[500px] bg-duomind-purple/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[400px] h-[400px] bg-duomind-blue/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-montserrat mb-6">
            Готов попробовать <span className="gradient-text">DuoMind</span>?
          </h2>
          <p className="text-xl text-gray-700 mb-8">
            Запусти свою первую AI-команду — бесплатно.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-duomind-purple hover:bg-duomind-purple/90 text-white font-medium py-6 px-6 rounded-lg flex items-center gap-2 text-base">
              Попробовать сейчас
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="outline" className="border-duomind-purple text-duomind-purple hover:bg-duomind-purple/5 font-medium py-6 px-6 rounded-lg text-base">
              Записаться на демо
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;