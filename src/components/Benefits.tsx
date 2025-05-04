import { Card, CardContent } from "@/components/ui/card";
import { Clock, Compass, LayersIcon, Scale } from "lucide-react";

const Benefits = () => {
  const benefits = [
    {
      title: "Быстро",
      description: "Отчёт за 10 минут, а не 3 дня",
      icon: <Clock className="h-10 w-10" />,
      color: "bg-gradient-to-br from-duomind-purple to-duomind-blue"
    },
    {
      title: "Глубоко",
      description: "Агенты понимают суть задачи",
      icon: <Compass className="h-10 w-10" />,
      color: "bg-gradient-to-br from-duomind-blue to-duomind-lightPurple"
    },
    {
      title: "Структурно",
      description: "Работа выполняется пошагово, как в реальной команде",
      icon: <LayersIcon className="h-10 w-10" />,
      color: "bg-gradient-to-br from-duomind-lightPurple to-duomind-purple"
    },
    {
      title: "Масштабируемо",
      description: "Подстраивается под любую сферу",
      icon: <Scale className="h-10 w-10" />,
      color: "bg-gradient-to-br from-duomind-blue to-duomind-purple"
    }
  ];

  return (
    <section id="why-duomind" className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-montserrat mb-6">
            Почему <span className="gradient-text">DuoMind</span>
          </h2>
          <p className="text-lg text-gray-700">
            Наша мультиагентная система превосходит обычные решения на базе искусственного интеллекта благодаря командному подходу
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <Card key={index} className="border-0 shadow-lg overflow-hidden">
              <div className={`h-2 ${benefit.color}`} />
              <CardContent className="pt-6">
                <div className={`w-16 h-16 rounded-full ${benefit.color} text-white flex items-center justify-center mb-4`}>
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-700">
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-20 max-w-4xl mx-auto bg-gray-50 rounded-2xl p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <h3 className="text-2xl font-bold font-montserrat mb-4">
                Обычный AI-ассистент
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center bg-gray-300 mr-3 text-white text-xs">✓</span>
                  <span className="text-gray-600">Отвечает на простые вопросы</span>
                </li>
                <li className="flex items-center">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center bg-gray-300 mr-3 text-white text-xs">✓</span>
                  <span className="text-gray-600">Генерирует тексты на основе запроса</span>
                </li>
                <li className="flex items-center">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center bg-gray-300 mr-3 text-white text-xs">✓</span>
                  <span className="text-gray-600">Помогает с рутинными задачами</span>
                </li>
                <li className="flex items-center">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center bg-red-200 mr-3 text-white text-xs">⨯</span>
                  <span className="text-gray-600">Нет четкой структуры анализа</span>
                </li>
                <li className="flex items-center">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center bg-red-200 mr-3 text-white text-xs">⨯</span>
                  <span className="text-gray-600">Требует постоянного уточнения</span>
                </li>
                <li className="flex items-center">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center bg-red-200 mr-3 text-white text-xs">⨯</span>
                  <span className="text-gray-600">Результат требует существенной доработки</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-bold font-montserrat mb-4 gradient-text">
                DuoMind
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center bg-duomind-purple mr-3 text-white text-xs">✓</span>
                  <span className="text-gray-700 font-medium">Выполняет комплексный анализ</span>
                </li>
                <li className="flex items-center">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center bg-duomind-purple mr-3 text-white text-xs">✓</span>
                  <span className="text-gray-700 font-medium">Структурирует данные по методологии</span>
                </li>
                <li className="flex items-center">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center bg-duomind-purple mr-3 text-white text-xs">✓</span>
                  <span className="text-gray-700 font-medium">Создает готовый к использованию результат</span>
                </li>
                <li className="flex items-center">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center bg-duomind-purple mr-3 text-white text-xs">✓</span>
                  <span className="text-gray-700 font-medium">Планирует работу и следует методологии</span>
                </li>
                <li className="flex items-center">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center bg-duomind-purple mr-3 text-white text-xs">✓</span>
                  <span className="text-gray-700 font-medium">Предлагает обоснованные выводы и решения</span>
                </li>
                <li className="flex items-center">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center bg-duomind-purple mr-3 text-white text-xs">✓</span>
                  <span className="text-gray-700 font-medium">Автоматически создает финальный отчет</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;