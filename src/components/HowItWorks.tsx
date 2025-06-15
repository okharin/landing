import { ArrowRight } from "lucide-react";

const HowItWorks = () => {
  const agents = [
    {
      role: "Аналитик данных",
      description: "Изучает информацию, находит закономерности и выявляет ключевые инсайты"
    },
    {
      role: "Исследователь",
      description: "Изучает предметную область, собирает факты и аргументы из различных источников"
    },
    {
      role: "Составитель отчетов",
      description: "Структурирует информацию и создает готовые к использованию документы"
    },
    {
      role: "Координатор",
      description: "Распределяет задачи между агентами и обеспечивает последовательность работы"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-montserrat mb-6">
            Как работает <span className="gradient-text">DuoMind</span>
          </h2>
          <p className="text-lg text-gray-700">
            Ты ставишь цель — мы создаём команду ИИ.
          </p>
        </div>

        <div className="relative">
          {/* Connection line */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-duomind-purple to-duomind-blue hidden lg:block"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-white rounded-xl shadow-lg p-6 relative z-10">
              <div className="w-12 h-12 flex items-center justify-center bg-duomind-purple text-white rounded-full font-bold text-lg mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Опиши свою задачу</h3>
              <p className="text-gray-600">
                Расскажи, какой результат тебе нужно получить и какие данные у тебя есть
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="bg-white rounded-xl shadow-lg p-6 relative z-10">
              <div className="w-12 h-12 flex items-center justify-center bg-duomind-blue text-white rounded-full font-bold text-lg mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Формирование команды</h3>
              <p className="text-gray-600">
                Система автоматически подбирает необходимых агентов для решения твоей задачи
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="bg-white rounded-xl shadow-lg p-6 relative z-10">
              <div className="w-12 h-12 flex items-center justify-center bg-duomind-purple text-white rounded-full font-bold text-lg mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Командная работа</h3>
              <p className="text-gray-600">
                Агенты обмениваются информацией и создают поэтапный результат
              </p>
            </div>
            
            {/* Step 4 */}
            <div className="bg-white rounded-xl shadow-lg p-6 relative z-10">
              <div className="w-12 h-12 flex items-center justify-center bg-duomind-blue text-white rounded-full font-bold text-lg mb-4">
                4
              </div>
              <h3 className="text-xl font-semibold mb-2">Готовый результат</h3>
              <p className="text-gray-600">
                Ты получаешь готовый отчет, анализ или исследование в нужном формате
              </p>
            </div>
          </div>
        </div>

        <div className="mt-20">
          <h3 className="text-2xl font-bold font-montserrat mb-8 text-center">
            Каждая задача делится между специализированными агентами
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {agents.map((agent, index) => (
              <div 
                key={index}
                className="flex items-start p-6 bg-white rounded-xl shadow-md transition-transform hover:-translate-y-1 duration-300"
              >
                <div className="w-10 h-10 gradient-bg rounded-full flex items-center justify-center text-white font-bold shrink-0 mr-4">
                  {index + 1}
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">{agent.role}</h4>
                  <p className="text-gray-600">{agent.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <a href="#capabilities" className="inline-flex items-center text-duomind-purple hover:text-duomind-blue font-medium">
              Узнать о возможностях
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;