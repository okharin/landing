import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Capabilities = () => {
  const scenarios = [
    {
      id: "market-analysis",
      name: "Рыночный анализ",
      description: "Анализ рынка, конкурентов и тенденций с выводами и рекомендациями",
      example: {
        title: "Анализ рынка электромобилей в России",
        content: (
          <div className="space-y-4">
            <p>DuoMind анализирует:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Текущее состояние рынка электромобилей</li>
              <li>Основных игроков и их стратегии</li>
              <li>Законодательные инициативы и ограничения</li>
              <li>Потребительский спрос и причины выбора</li>
              <li>Инфраструктурные возможности и ограничения</li>
            </ul>
            <p>В результате вы получаете структурированный отчет с выводами, инсайтами и прогнозом развития на ближайшие 3-5 лет.</p>
          </div>
        )
      }
    },
    {
      id: "data-analysis",
      name: "Анализ данных",
      description: "Обработка данных, выявление тенденций и зависимостей",
      example: {
        title: "Анализ поведения пользователей сайта",
        content: (
          <div className="space-y-4">
            <p>DuoMind исследует:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Статистику посещений и уникальных пользователей</li>
              <li>Пути пользователей по сайту</li>
              <li>Конверсионные воронки и слабые места</li>
              <li>Демографические и поведенческие характеристики</li>
              <li>Сезонность и изменения предпочтений</li>
            </ul>
            <p>Вы получаете понятный отчет с выявленными проблемами и рекомендациями по улучшению пользовательского опыта.</p>
          </div>
        )
      }
    },
    {
      id: "document-analysis",
      name: "Анализ документов",
      description: "Обработка и анализ больших массивов документов, извлечение ключевых данных",
      example: {
        title: "Анализ юридических документов и контрактов",
        content: (
          <div className="space-y-4">
            <p>DuoMind обрабатывает:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Юридические соглашения и договоры</li>
              <li>Технические спецификации и документацию</li>
              <li>Регуляторные требования и нормативы</li>
              <li>Судебные решения и прецеденты</li>
              <li>Корпоративные политики и процедуры</li>
            </ul>
            <p>В результате вы получаете сводку ключевых положений, рисков и возможностей, экономя десятки часов на чтении.</p>
          </div>
        )
      }
    },
    {
      id: "strategy",
      name: "Разработка стратегии",
      description: "Формирование стратегических рекомендаций на основе анализа данных и рынка",
      example: {
        title: "Стратегия выхода на новый рынок",
        content: (
          <div className="space-y-4">
            <p>DuoMind разрабатывает:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Анализ целевого рынка и потенциального спроса</li>
              <li>Конкурентный ландшафт и позиционирование</li>
              <li>Оценку рисков и барьеров для входа</li>
              <li>План поэтапного выхода с временными рамками</li>
              <li>Метрики успеха и KPI для отслеживания прогресса</li>
            </ul>
            <p>Вы получаете готовый стратегический план, который можно использовать для презентации руководству или инвесторам.</p>
          </div>
        )
      }
    }
  ];

  return (
    <section id="capabilities" className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-montserrat mb-6">
            Что умеет <span className="gradient-text">DuoMind</span>
          </h2>
          <p className="text-lg text-gray-700">
            Мультиагентная система справляется со сложными аналитическими задачами быстрее и эффективнее, чем человек
          </p>
        </div>

        <div>
          <Tabs defaultValue="market-analysis" className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-1">
                {scenarios.map((scenario) => (
                  <TabsTrigger 
                    key={scenario.id} 
                    value={scenario.id}
                    className="text-xs md:text-sm py-2 px-2 md:px-4"
                  >
                    {scenario.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            
            {scenarios.map((scenario) => (
              <TabsContent 
                key={scenario.id} 
                value={scenario.id} 
                className="mt-0"
              >
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-0">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                      <div className="p-8 bg-gradient-to-br from-duomind-purple/10 to-duomind-blue/10">
                        <h3 className="text-2xl font-semibold mb-4 font-montserrat gradient-text">
                          {scenario.name}
                        </h3>
                        <p className="text-gray-700 mb-6">
                          {scenario.description}
                        </p>
                        <div className="bg-white/80 p-6 rounded-lg">
                          <h4 className="text-lg font-medium mb-2">Сценарий использования:</h4>
                          <p className="text-duomind-darkBlue font-medium">
                            {scenario.example.title}
                          </p>
                        </div>
                      </div>
                      <div className="p-8 border-t md:border-t-0 md:border-l border-gray-200 bg-white">
                        <h4 className="text-lg font-semibold mb-4">
                          Пример результата
                        </h4>
                        <div className="text-gray-700">
                          {scenario.example.content}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </section>
  );
};

export default Capabilities;